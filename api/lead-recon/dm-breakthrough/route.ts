import { NextRequest, NextResponse } from "next/server";
import { leadReconDMBreakthroughNode } from "../../../agents/lead-recon-dm-breakthrough";
import {
  applyGuardrails,
  DMBreakthroughInputSchema,
  getRateLimitInfo,
} from "../../../lib/lead-recon-guardrails";

export async function POST(request: NextRequest) {
  try {
    // Apply guardrails (authentication, rate limiting, validation)
    const guardrailResult = await applyGuardrails(
      request,
      "dmBreakthrough",
      DMBreakthroughInputSchema
    );

    if (!guardrailResult.success) {
      return guardrailResult;
    }

    const { data: body, clientId } = guardrailResult;

    // Create packet for the Lead Recon DM Breakthrough
    const packet = {
      eventId: body.eventId,
      prospect: {
        name: body.prospectName,
        company: body.prospectCompany,
        role: body.prospectRole,
        industry: body.prospectIndustry,
        location: body.prospectLocation,
        email: body.prospectEmail,
        phone: body.prospectPhone,
        linkedin: body.prospectLinkedin,
        companySize: body.prospectCompanySize,
        website: body.prospectWebsite,
        recentNews: body.prospectRecentNews || [],
        challenges: body.prospectChallenges || [],
        goals: body.prospectGoals || [],
        source: body.prospectSource,
        previousInteraction: body.prospectPreviousInteraction || [],
        interests: body.prospectInterests || [],
        painPoints: body.prospectPainPoints || [],
        decisionMaking: body.prospectDecisionMaking || {},
        communicationStyle: body.prospectCommunicationStyle || {},
      },
      lead: {
        name: body.prospectName,
        company: body.prospectCompany,
        role: body.prospectRole,
        industry: body.prospectIndustry,
        location: body.prospectLocation,
        email: body.prospectEmail,
        phone: body.prospectPhone,
        linkedin: body.prospectLinkedin,
        companySize: body.prospectCompanySize,
        website: body.prospectWebsite,
        source: body.prospectSource,
      },
      business: {
        services: body.businessServices,
        valueProposition: body.businessValueProposition,
        caseStudies: body.businessCaseStudies || [],
        testimonials: body.businessTestimonials || [],
        pricing: body.businessPricing,
      },
      offer: {
        services: body.businessServices,
        pricing: body.businessPricing,
        valueProposition: body.businessValueProposition,
      },
    };

    // Execute the Lead Recon DM Breakthrough agent
    const result = await leadReconDMBreakthroughNode({
      packet,
      artifacts: {},
    });

    const rateLimitInfo = getRateLimitInfo(clientId, "dmBreakthrough");

    return NextResponse.json({
      success: true,
      data: result.artifacts.leadReconDMBreakthrough,
      eventId: body.eventId,
      rateLimit: {
        remaining: rateLimitInfo.remaining,
        resetTime: rateLimitInfo.resetTime,
      },
    });
  } catch (error) {
    console.error("Lead Recon DM Breakthrough API error:", error);
    return NextResponse.json(
      {
        error: "Failed to process Lead Recon DM Breakthrough request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Lead Recon DM Breakthrough API",
    description:
      "Get the attention of your dream prospects with smart messaging to get their attention",
    endpoints: {
      POST: "/api/lead-recon/dm-breakthrough",
      description:
        "Generate breakthrough messaging strategies and personalized message templates",
    },
    requiredFields: [
      "eventId",
      "prospectName",
      "prospectCompany",
      "prospectRole",
      "businessServices",
      "businessValueProposition",
    ],
    optionalFields: [
      "prospectIndustry",
      "prospectLocation",
      "prospectEmail",
      "prospectPhone",
      "prospectLinkedin",
      "prospectCompanySize",
      "prospectWebsite",
      "prospectRecentNews",
      "prospectChallenges",
      "prospectGoals",
      "prospectSource",
      "prospectPreviousInteraction",
      "prospectInterests",
      "prospectPainPoints",
      "prospectDecisionMaking",
      "prospectCommunicationStyle",
      "businessCaseStudies",
      "businessTestimonials",
      "businessPricing",
    ],
  });
}
