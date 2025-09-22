import { NextRequest, NextResponse } from "next/server";
import { leadReconContentCreatorNode } from "../../../agents/lead-recon-content-creator";
import {
  applyGuardrails,
  ContentCreatorInputSchema,
  getRateLimitInfo,
} from "../../../lib/lead-recon-guardrails";

export async function POST(request: NextRequest) {
  try {
    // Apply guardrails (authentication, rate limiting, validation)
    const guardrailResult = await applyGuardrails(
      request,
      "contentCreator",
      ContentCreatorInputSchema
    );

    if (!guardrailResult.success) {
      return guardrailResult;
    }

    const { data: body, clientId } = guardrailResult;

    // Create packet for the Lead Recon Content Creator
    const packet = {
      eventId: body.eventId,
      business: {
        name: body.businessName,
        industry: body.industry,
        services: body.services,
        valueProposition: body.valueProposition,
        targetAudience: body.targetAudience,
        brandVoice: body.brandVoice || "Professional, helpful, authoritative",
      },
      content: {
        goals: body.contentGoals || [
          "Brand awareness",
          "Lead generation",
          "Thought leadership",
        ],
        types: body.contentTypes || [
          "Blog posts",
          "Social media",
          "Email",
          "Video",
          "Webinars",
        ],
        frequency: body.contentFrequency || "Weekly",
        channels: body.contentChannels || [
          "Website",
          "LinkedIn",
          "Email",
          "Social media",
        ],
        budget: body.contentBudget || "Moderate",
        resources: body.contentResources || [
          "In-house team",
          "External writers",
        ],
      },
      audience: {
        demographics: body.audienceDemographics || {},
        psychographics: body.audiencePsychographics || {},
        painPoints: body.audiencePainPoints || [],
        interests: body.audienceInterests || [],
        mediaConsumption: body.audienceMediaConsumption || {},
        contentPreferences: body.audienceContentPreferences || {},
      },
      competitors: {
        contentAnalysis: body.competitorContentAnalysis || [],
        contentGaps: body.competitorContentGaps || [],
        opportunities: body.competitorOpportunities || [],
      },
      existing: {
        currentContent: body.existingCurrentContent || [],
        performance: body.existingPerformance || {},
        gaps: body.existingGaps || [],
      },
    };

    // Execute the Lead Recon Content Creator agent
    const result = await leadReconContentCreatorNode({
      packet,
      artifacts: {},
    });

    const rateLimitInfo = getRateLimitInfo(clientId, "contentCreator");

    return NextResponse.json({
      success: true,
      data: result.artifacts.leadReconContentCreator,
      eventId: body.eventId,
      rateLimit: {
        remaining: rateLimitInfo.remaining,
        resetTime: rateLimitInfo.resetTime,
      },
    });
  } catch (error) {
    console.error("Lead Recon Content Creator API error:", error);
    return NextResponse.json(
      {
        error: "Failed to process Lead Recon Content Creator request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Lead Recon Content Creator API",
    description:
      "The tailored content creator working from your ideal clients and the types of media they are looking for",
    endpoints: {
      POST: "/api/lead-recon/content-creator",
      description:
        "Generate comprehensive content strategy and tailored content pieces",
    },
    requiredFields: [
      "eventId",
      "businessName",
      "industry",
      "services",
      "valueProposition",
    ],
    optionalFields: [
      "targetAudience",
      "brandVoice",
      "contentGoals",
      "contentTypes",
      "contentFrequency",
      "contentChannels",
      "contentBudget",
      "contentResources",
      "audienceDemographics",
      "audiencePsychographics",
      "audiencePainPoints",
      "audienceInterests",
      "audienceMediaConsumption",
      "audienceContentPreferences",
      "competitorContentAnalysis",
      "competitorContentGaps",
      "competitorOpportunities",
      "existingCurrentContent",
      "existingPerformance",
      "existingGaps",
    ],
  });
}
