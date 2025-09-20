import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, AbmStage } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const AdvanceAccountSchema = z.object({
  accountId: z.string().min(1),
  toStage: z.enum(["IDENTIFY", "ENGAGE", "ACTIVATE", "CLOSE", "EXPAND"]),
  reason: z.string().optional(),
  actor: z.string().default("system"),
});

const STAGE_FLOW = {
  IDENTIFY: ["ENGAGE"],
  ENGAGE: ["ACTIVATE"],
  ACTIVATE: ["CLOSE", "EXPAND"],
  CLOSE: ["EXPAND"],
  EXPAND: [],
} as Record<AbmStage, AbmStage[]>;

function isAuthorized(request: NextRequest): boolean {
  const token = request.headers.get("x-abm-token");
  return token === process.env.ABM_TOKEN;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { accountId, toStage, reason, actor } =
      AdvanceAccountSchema.parse(body);

    // Get current account
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Validate stage transition
    const validTransitions = STAGE_FLOW[account.abmStage];
    if (!validTransitions.includes(toStage)) {
      return NextResponse.json(
        {
          error: `Invalid stage transition from ${account.abmStage} to ${toStage}`,
        },
        { status: 400 }
      );
    }

    // Update account stage
    const updatedAccount = await prisma.account.update({
      where: { id: accountId },
      data: { abmStage: toStage },
      include: {
        contacts: true,
        opportunities: true,
        intent: true,
        activities: true,
        segments: true,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        accountId,
        channel: "system",
        action: `stage_advance_to_${toStage.toLowerCase()}`,
        actor,
        meta: {
          fromStage: account.abmStage,
          toStage,
          reason,
        },
      },
    });

    // Emit stage change event to n8n
    if (process.env.N8N_ABM_EVENT_URL) {
      try {
        await fetch(process.env.N8N_ABM_EVENT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "stage_change",
            data: {
              accountId,
              fromStage: account.abmStage,
              toStage,
              reason,
              actor,
              account: updatedAccount,
            },
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (eventError) {
        console.error("Failed to emit stage change event to n8n:", eventError);
        // Don't fail the main request if event emission fails
      }
    }

    return NextResponse.json({ data: updatedAccount });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error advancing account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
