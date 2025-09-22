import { NextRequest, NextResponse } from "next/server";
import { leadReconProfilerNode } from "../../../agents/lead-recon-profiler";
import {
  applyGuardrails,
  ProfilerInputSchema,
  getRateLimitInfo,
} from "../../../lib/lead-recon-guardrails";

export async function POST(request: NextRequest) {
  try {
    // Apply guardrails (authentication, rate limiting, validation)
    const guardrailResult = await applyGuardrails(
      request,
      "profiler",
      ProfilerInputSchema
    );

    if (!guardrailResult.success) {
      return guardrailResult;
    }

    const { data: body, clientId } = guardrailResult;

    // Create packet for the Lead Recon Profiler
    const packet = {
      eventId: body.eventId,
      website: body.website,
      business: {
        name: body.businessName,
        industry: body.industry,
        services: body.services,
        valueProposition: body.valueProposition,
        targetMarket: body.targetMarket,
        competitors: body.competitors || [],
        marketSize: body.marketSize,
        location: body.location,
        businessModel: body.businessModel,
        revenue: body.revenue,
        employees: body.employees,
      },
      audience: {
        industry: body.industry,
        size: body.audienceSize,
        location: body.location,
        targetAudience: body.targetAudience,
      },
      leadSources: {
        crm: body.crmConfig,
        social: body.socialConfig,
        website: body.websiteConfig,
      },
    };

    // Execute the Lead Recon Profiler agent
    const result = await leadReconProfilerNode({
      packet,
      artifacts: {},
    });

    const rateLimitInfo = getRateLimitInfo(clientId, "profiler");

    return NextResponse.json({
      success: true,
      data: result.artifacts.leadReconProfiler,
      eventId: body.eventId,
      rateLimit: {
        remaining: rateLimitInfo.remaining,
        resetTime: rateLimitInfo.resetTime,
      },
    });
  } catch (error) {
    console.error("Lead Recon Profiler API error:", error);
    return NextResponse.json(
      {
        error: "Failed to process Lead Recon Profiler request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Lead Recon Profiler API",
    description:
      "Builds ideal client profiles using website input and strategic questioning",
    endpoints: {
      POST: "/api/lead-recon/profiler",
      description: "Generate ideal client profiles and personas",
    },
    requiredFields: [
      "eventId",
      "website (optional)",
      "businessName",
      "industry",
      "services",
      "valueProposition",
    ],
    optionalFields: [
      "targetMarket",
      "competitors",
      "marketSize",
      "location",
      "businessModel",
      "revenue",
      "employees",
      "audienceSize",
      "targetAudience",
      "crmConfig",
      "socialConfig",
      "websiteConfig",
    ],
  });
}
