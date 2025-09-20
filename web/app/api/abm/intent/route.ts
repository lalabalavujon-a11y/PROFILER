import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const IntentSignalSchema = z.object({
  accountId: z.string().min(1),
  source: z.string().min(1),
  signal: z.string().min(1),
  weight: z.number().int().min(1).max(100).default(10),
  meta: z.record(z.any()).optional(),
});

function isAuthorized(request: NextRequest): boolean {
  const token = request.headers.get("x-abm-token");
  return token === process.env.ABM_TOKEN;
}

function verifyHMAC(request: NextRequest): boolean {
  const signature = request.headers.get("x-hmac-signature");
  if (!signature || !process.env.ABM_HMAC_SECRET) {
    return false;
  }

  // For webhook verification, you'd implement HMAC verification here
  // This is a simplified version - in production, verify the payload signature
  return true;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");
    const days = parseInt(searchParams.get("days") || "30");
    const limit = parseInt(searchParams.get("limit") || "100");

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const intentSignals = await prisma.intentSignal.findMany({
      where: {
        ...(accountId && { accountId }),
        createdAt: { gte: since },
      },
      include: {
        account: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ data: intentSignals });
  } catch (error) {
    console.error("Error fetching intent signals:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Allow both token auth and HMAC webhook auth
  if (!isAuthorized(request) && !verifyHMAC(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = IntentSignalSchema.parse(body);

    // Verify account exists
    const account = await prisma.account.findUnique({
      where: { id: validatedData.accountId },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const intentSignal = await prisma.intentSignal.create({
      data: validatedData,
      include: {
        account: {
          select: { id: true, name: true, abmStage: true },
        },
      },
    });

    // Emit event to n8n if configured
    if (process.env.N8N_ABM_EVENT_URL) {
      try {
        await fetch(process.env.N8N_ABM_EVENT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-hmac-signature": request.headers.get("x-hmac-signature") || "",
          },
          body: JSON.stringify({
            type: "intent_signal",
            data: intentSignal,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (eventError) {
        console.error("Failed to emit intent event to n8n:", eventError);
        // Don't fail the main request if event emission fails
      }
    }

    return NextResponse.json({ data: intentSignal }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating intent signal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
