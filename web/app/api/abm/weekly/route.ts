import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function GET(_req: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      {
        ok: false,
        reason: "RESEND_API_KEY missing",
      },
      { status: 500 }
    );
  }

  const toList = (process.env.ABM_WEEKLY_TO || "")
    .split(/[,;\s]+/)
    .filter(Boolean);
  if (!toList.length) {
    return NextResponse.json(
      {
        ok: false,
        reason: "ABM_WEEKLY_TO missing",
      },
      { status: 500 }
    );
  }

  const today = startOfDay(new Date());
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const twoWeeks = new Date(today);
  twoWeeks.setDate(twoWeeks.getDate() - 14);

  const intents = await prisma.intentSignal.findMany({
    where: { createdAt: { gte: twoWeeks } },
    select: { accountId: true, weight: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const byAcc = new Map<string, { thisW: number; prevW: number }>();
  for (const i of intents) {
    const bucket = i.createdAt >= weekAgo ? "thisW" : "prevW";
    const cur = byAcc.get(i.accountId) || { thisW: 0, prevW: 0 };
    cur[bucket as "thisW" | "prevW"] += i.weight || 0;
    byAcc.set(i.accountId, cur);
  }

  const accounts = await prisma.account.findMany({
    select: { id: true, name: true, abmStage: true },
  });

  const scored = accounts
    .map((a) => ({
      id: a.id,
      name: a.name,
      stage: a.abmStage,
      thisW: byAcc.get(a.id)?.thisW || 0,
      prevW: byAcc.get(a.id)?.prevW || 0,
      delta: (byAcc.get(a.id)?.thisW || 0) - (byAcc.get(a.id)?.prevW || 0),
    }))
    .sort((a, b) => b.thisW - a.thisW)
    .slice(0, 15);

  const totalThis = scored.reduce((s, a) => s + a.thisW, 0);
  const totalPrev = scored.reduce((s, a) => s + a.prevW, 0) || 1;
  const wow = Math.round(((totalThis - totalPrev) / totalPrev) * 100);

  const html = `
  <div style="font-family:Inter,Arial,sans-serif;max-width:800px;margin:0 auto">
    <h2 style="color:#1f2937;margin-bottom:20px">ABM · Weekly Exec Brief</h2>
    <p style="margin-bottom:20px;color:#374151">
      Total Intent (Top 15 accounts): <strong>${totalThis}</strong>
      (<span style="color:${wow >= 0 ? "green" : "red"}">${wow}% WoW</span>)
    </p>
    <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;border:1px solid #e5e7eb;margin-bottom:20px">
      <thead style="background:#f9fafb">
        <tr>
          <th align="left" style="border-bottom:1px solid #e5e7eb;padding:8px">Account</th>
          <th align="center" style="border-bottom:1px solid #e5e7eb;padding:8px">Stage</th>
          <th align="right" style="border-bottom:1px solid #e5e7eb;padding:8px">Prev</th>
          <th align="right" style="border-bottom:1px solid #e5e7eb;padding:8px">This</th>
          <th align="right" style="border-bottom:1px solid #e5e7eb;padding:8px">Δ</th>
        </tr>
      </thead>
      <tbody>
        ${scored
          .map(
            (a) => `
          <tr>
            <td style="border-bottom:1px solid #f3f4f6;padding:8px">${
              a.name
            }</td>
            <td align="center" style="border-bottom:1px solid #f3f4f6;padding:8px">${
              a.stage
            }</td>
            <td align="right" style="border-bottom:1px solid #f3f4f6;padding:8px">${
              a.prevW
            }</td>
            <td align="right" style="border-bottom:1px solid #f3f4f6;padding:8px">${
              a.thisW
            }</td>
            <td align="right" style="border-bottom:1px solid #f3f4f6;padding:8px;color:${
              a.delta >= 0 ? "green" : "red"
            }">${a.delta}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
    <div style="margin-top:20px;padding:15px;background:#f0f9ff;border-left:4px solid #0ea5e9">
      <h3 style="margin:0 0 10px 0;color:#0369a1">Key Insights</h3>
      <ul style="margin:0;padding-left:20px;color:#0c4a6e">
        <li>Top 3 accounts by intent: ${scored
          .slice(0, 3)
          .map((a) => a.name)
          .join(", ")}</li>
        <li>Accounts with highest growth: ${scored
          .filter((a) => a.delta > 0)
          .slice(0, 3)
          .map((a) => a.name)
          .join(", ")}</li>
        <li>Pipeline stage distribution: ${
          scored.filter((a) => a.stage === "ENGAGE").length
        } Engaged, ${
    scored.filter((a) => a.stage === "ACTIVATE").length
  } Activated</li>
      </ul>
    </div>
    <p style="color:#6b7280;font-size:12px;margin-top:20px">
      Generated ${new Date().toUTCString()}
    </p>
  </div>`;

  // Send email using Resend (or your preferred email service)
  try {
    const resend = await import("resend");
    const emailClient = new resend.Resend(process.env.RESEND_API_KEY);

    await emailClient.emails.send({
      from: process.env.DIGEST_FROM || "insights@leadrecon.com",
      to: toList,
      subject: `ABM · Weekly Exec Brief (${today.toDateString()})`,
      html,
    });

    return NextResponse.json({
      ok: true,
      sent: toList.length,
      recipients: toList,
      totalIntent: totalThis,
      wowChange: wow,
    });
  } catch (error) {
    console.error("Error sending weekly brief:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to send email",
      },
      { status: 500 }
    );
  }
}
