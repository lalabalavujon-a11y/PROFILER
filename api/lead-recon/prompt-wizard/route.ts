import { NextRequest, NextResponse } from "next/server";
import { leadReconPromptWizardNode } from "../../../agents/lead-recon-prompt-wizard";
import {
  applyGuardrails,
  PromptWizardInputSchema,
  getRateLimitInfo,
} from "../../../lib/lead-recon-guardrails";

export async function POST(request: NextRequest) {
  try {
    // Apply guardrails (authentication, rate limiting, validation)
    const guardrailResult = await applyGuardrails(
      request,
      "promptWizard",
      PromptWizardInputSchema
    );

    if (!guardrailResult.success) {
      return guardrailResult;
    }

    const { data: body, clientId } = guardrailResult;

    // Create packet for the Lead Recon Prompt Wizard
    const packet = {
      eventId: body.eventId,
      userRequest: body.userRequest,
      intent: body.intent,
      useCase: body.useCase || "general",
      promptType: body.promptType || "general",
      complexity: body.complexity || "medium",
      tone: body.tone || "professional",
      promptLength: body.promptLength || "medium",
      requiredVariables: body.requiredVariables || [],
      examples: body.examples || [],
      leadData: {
        website: body.website,
        companyName: body.companyName,
        contactPerson: body.contactPerson,
        linkedinUrl: body.linkedinUrl,
        peopleInfo: body.peopleInfo,
        influencerName: body.influencerName,
        influencerProfile: body.influencerProfile,
        influencerInfo: body.influencerInfo,
      },
      website: body.website,
      companyName: body.companyName,
      contactPerson: body.contactPerson,
      linkedinUrl: body.linkedinUrl,
      peopleInfo: body.peopleInfo,
      influencerName: body.influencerName,
      influencerProfile: body.influencerProfile,
      influencerInfo: body.influencerInfo,
    };

    // Execute the Lead Recon Prompt Wizard agent
    const result = await leadReconPromptWizardNode({
      packet,
      artifacts: {},
    });

    const rateLimitInfo = getRateLimitInfo(clientId, "promptWizard");

    return NextResponse.json({
      success: true,
      data: result.artifacts.leadReconPromptWizard,
      eventId: body.eventId,
      rateLimit: {
        remaining: rateLimitInfo.remaining,
        resetTime: rateLimitInfo.resetTime,
      },
    });
  } catch (error) {
    console.error("Lead Recon Prompt Wizard API error:", error);
    return NextResponse.json(
      {
        error: "Failed to process Lead Recon Prompt Wizard request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Lead Recon Prompt Wizard API",
    description:
      "Your intelligent assistant for creating high-impact AI prompts for prospecting leads using Lead Recon Pro data",
    endpoints: {
      POST: "/api/lead-recon/prompt-wizard",
      description:
        "Generate AI prompts for Lead Recon Pro with variable analysis and optimization suggestions",
    },
    requiredFields: ["eventId", "userRequest"],
    optionalFields: [
      "intent",
      "useCase",
      "promptType",
      "complexity",
      "tone",
      "promptLength",
      "requiredVariables",
      "examples",
      "website",
      "companyName",
      "contactPerson",
      "linkedinUrl",
      "peopleInfo",
      "influencerName",
      "influencerProfile",
      "influencerInfo",
    ],
    availableVariables: [
      "#website → The lead's website",
      "#companyName → The name of the company",
      "#contactPerson → The name of the lead or decision-maker",
      "#linkedinUrl → The URL of the person's LinkedIn Profile",
      "#peopleInfo → The information about the person from their LinkedIn profile",
      "#influencerName → The name of the Influencer",
      "#influencerProfile → The information the influencer has added to their profile",
      "#influencerInfo → The information about the influencer",
    ],
    exampleRequests: [
      {
        userRequest: "I want to analyze their SEO",
        description: "Generate SEO analysis prompt",
      },
      {
        userRequest: "Write a cold outreach message",
        description: "Generate cold outreach prompt",
      },
      {
        userRequest: "Help me evaluate their content marketing strategy",
        description: "Generate content strategy analysis prompt",
      },
      {
        userRequest: "Give me ideas for LinkedIn icebreakers",
        description: "Generate LinkedIn engagement prompt",
      },
    ],
  });
}
