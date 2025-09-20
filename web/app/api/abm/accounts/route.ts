import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const CreateAccountSchema = z.object({
  name: z.string().min(1),
  domain: z.string().url().optional(),
  hqCity: z.string().optional(),
  region: z.string().optional(),
  industry: z.string().optional(),
  tier: z.enum(["TARGET", "STRATEGIC", "EXPANSION"]).default("TARGET"),
  status: z
    .enum(["PROSPECT", "ACTIVE", "CHURN_RISK", "CLOSED"])
    .default("PROSPECT"),
  icpScore: z.number().int().min(0).max(100).default(0),
  abmStage: z
    .enum(["IDENTIFY", "ENGAGE", "ACTIVATE", "CLOSE", "EXPAND"])
    .default("ENGAGE"),
  notes: z.string().optional(),
  owners: z.record(z.string()).optional(),
});

const UpdateAccountSchema = CreateAccountSchema.partial();

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
    const tier = searchParams.get("tier");
    const stage = searchParams.get("stage");
    const limit = parseInt(searchParams.get("limit") || "50");

    const accounts = await prisma.account.findMany({
      where: {
        ...(tier && { tier: tier as any }),
        ...(stage && { abmStage: stage as any }),
      },
      include: {
        contacts: true,
        opportunities: true,
        intent: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: {
          select: {
            contacts: true,
            opportunities: true,
            activities: true,
          },
        },
      },
      orderBy: { icpScore: "desc" },
      take: limit,
    });

    return NextResponse.json({ data: accounts });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = CreateAccountSchema.parse(body);

    const account = await prisma.account.create({
      data: validatedData,
      include: {
        contacts: true,
        opportunities: true,
        intent: true,
        activities: true,
        segments: true,
      },
    });

    return NextResponse.json({ data: account }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("id");

    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = UpdateAccountSchema.parse(body);

    const account = await prisma.account.update({
      where: { id: accountId },
      data: validatedData,
      include: {
        contacts: true,
        opportunities: true,
        intent: true,
        activities: true,
        segments: true,
      },
    });

    return NextResponse.json({ data: account });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
