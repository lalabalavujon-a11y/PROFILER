import { NextRequest, NextResponse } from "next/server";
import { leadReconStrategistNode } from "../../../agents/lead-recon-strategist";
import {
  applyGuardrails,
  StrategistInputSchema,
  getRateLimitInfo,
} from "../../../lib/lead-recon-guardrails";

export async function POST(request: NextRequest) {
  try {
    // Apply guardrails (authentication, rate limiting, validation)
    const guardrailResult = await applyGuardrails(
      request,
      "strategist",
      StrategistInputSchema
    );

    if (!guardrailResult.success) {
      return guardrailResult;
    }

    const { data: body, clientId } = guardrailResult;

    // Create packet for the Lead Recon Strategist
    const packet = {
      eventId: body.eventId,
      business: {
        name: body.businessName,
        industry: body.industry,
        size: body.businessSize,
        location: body.location,
        website: body.website,
        services: body.services,
        valueProposition: body.valueProposition,
        uniqueSellingPoints: body.uniqueSellingPoints || [],
        targetAudience: body.targetAudience,
        marketSize: body.marketSize,
        competitors: body.competitors || [],
        marketPosition: body.marketPosition,
        goals: body.businessGoals || [],
        marketingGoals: body.marketingGoals || [],
        revenueTargets: body.revenueTargets,
        growthTargets: body.growthTargets,
        marketingBudget: body.marketingBudget,
        teamSize: body.teamSize,
        marketingTools: body.marketingTools || [],
        timeline: body.timeline,
      },
      audience: {
        targetAudience: body.targetAudience,
        industry: body.industry,
        size: body.audienceSize,
        location: body.location,
      },
      offer: {
        services: body.services,
        pricing: body.pricing,
        valueProposition: body.valueProposition,
      },
    };

    // Execute the Lead Recon Strategist agent
    const result = await leadReconStrategistNode({
      packet,
      artifacts: {},
    });

    const rateLimitInfo = getRateLimitInfo(clientId, "strategist");

    return NextResponse.json({
      success: true,
      data: result.artifacts.leadReconStrategist,
      eventId: body.eventId,
      rateLimit: {
        remaining: rateLimitInfo.remaining,
        resetTime: rateLimitInfo.resetTime,
      },
    });
  } catch (error) {
    console.error("Lead Recon Strategist API error:", error);
    return NextResponse.json(
      {
        error: "Failed to process Lead Recon Strategist request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Lead Recon Strategist API",
    description:
      "Your ultimate marketing strategist to help you connect with ideal clients",
    endpoints: {
      POST: "/api/lead-recon/strategist",
      description:
        "Generate comprehensive marketing strategy and client connection strategies",
    },
    requiredFields: [
      "eventId",
      "businessName",
      "industry",
      "services",
      "valueProposition",
    ],
    optionalFields: [
      "businessSize",
      "location",
      "website",
      "uniqueSellingPoints",
      "targetAudience",
      "marketSize",
      "competitors",
      "marketPosition",
      "businessGoals",
      "marketingGoals",
      "revenueTargets",
      "growthTargets",
      "marketingBudget",
      "teamSize",
      "marketingTools",
      "timeline",
      "audienceSize",
      "pricing",
    ],
  });
}
