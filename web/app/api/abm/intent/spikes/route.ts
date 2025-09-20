import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function isAuthorized(request: NextRequest): boolean {
  const token = request.headers.get("x-abm-token");
  return token === process.env.ABM_TOKEN;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const threshold = parseFloat(searchParams.get("threshold") || "2"); // z-score threshold
    const minToday = parseInt(searchParams.get("minToday") || "10"); // minimum intent today

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get all accounts with intent signals in the last 7 days
    const accounts = await prisma.account.findMany({
      include: {
        intent: {
          where: {
            createdAt: { gte: sevenDaysAgo },
          },
          select: {
            weight: true,
            createdAt: true,
          },
        },
      },
    });

    const spikes = [];

    for (const account of accounts) {
      // Calculate today's intent
      const todayIntent = account.intent
        .filter((signal) => signal.createdAt >= today)
        .reduce((sum, signal) => sum + (signal.weight || 0), 0);

      // Only check accounts with minimum intent today
      if (todayIntent < minToday) continue;

      // Calculate 7-day mean and standard deviation (excluding today)
      const historicalSignals = account.intent
        .filter((signal) => signal.createdAt < today)
        .map((signal) => signal.weight || 0);

      if (historicalSignals.length < 3) continue; // Need at least 3 days of history

      const mean =
        historicalSignals.reduce((sum, val) => sum + val, 0) /
        historicalSignals.length;
      const variance =
        historicalSignals.reduce(
          (sum, val) => sum + Math.pow(val - mean, 2),
          0
        ) / historicalSignals.length;
      const stdDev = Math.sqrt(variance);

      // Avoid division by zero
      if (stdDev === 0) continue;

      // Calculate z-score
      const zScore = (todayIntent - mean) / stdDev;

      if (zScore >= threshold) {
        spikes.push({
          accountId: account.id,
          accountName: account.name,
          todayIntent,
          mean: Math.round(mean * 100) / 100,
          stdDev: Math.round(stdDev * 100) / 100,
          zScore: Math.round(zScore * 100) / 100,
          spikeIntensity: zScore >= 3 ? "HIGH" : zScore >= 2 ? "MEDIUM" : "LOW",
          historicalData: historicalSignals,
        });
      }
    }

    // Sort by z-score descending
    spikes.sort((a, b) => b.zScore - a.zScore);

    // Emit spike events to n8n if configured
    if (process.env.N8N_ABM_EVENT_URL && spikes.length > 0) {
      try {
        await fetch(process.env.N8N_ABM_EVENT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "intent_spikes",
            data: {
              spikes,
              threshold,
              minToday,
              detectedAt: new Date().toISOString(),
            },
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (eventError) {
        console.error("Failed to emit intent spikes event to n8n:", eventError);
      }
    }

    return NextResponse.json({
      success: true,
      spikes,
      summary: {
        totalSpikes: spikes.length,
        highIntensity: spikes.filter((s) => s.spikeIntensity === "HIGH").length,
        mediumIntensity: spikes.filter((s) => s.spikeIntensity === "MEDIUM")
          .length,
        lowIntensity: spikes.filter((s) => s.spikeIntensity === "LOW").length,
        threshold,
        minToday,
        detectedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error detecting intent spikes:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
