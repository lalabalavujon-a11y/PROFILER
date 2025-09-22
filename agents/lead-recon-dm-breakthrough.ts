import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { uploadBuffer } from "../lib/storage";
import { logAgentExecution } from "../lib/langsmith-config";

const schema = z.object({
  packet: z.any(),
  artifacts: z.any().default({}),
});

type LeadReconDMBreakthroughState = z.infer<typeof schema>;

export async function leadReconDMBreakthroughNode(
  state: LeadReconDMBreakthroughState
) {
  const startTime = Date.now();
  const { packet } = state;

  try {
    // Initialize AI model for message breakthrough
    const llm = new ChatOpenAI({
      modelName: process.env.LEAD_RECON_MODEL || "gpt-4",
      temperature: 0.5,
      tags: ["lead-recon", "dm-breakthrough", "messaging"],
    });

    // Extract prospect and context data
    const prospectData = await extractProspectData(packet);

    // Analyze prospect's communication patterns and preferences
    const communicationAnalysis = await analyzeCommunicationPatterns(
      prospectData,
      llm
    );

    // Generate breakthrough messaging strategies
    const breakthroughStrategies = await generateBreakthroughStrategies(
      prospectData,
      communicationAnalysis,
      llm
    );

    // Create personalized message templates
    const messageTemplates = await createMessageTemplates(
      prospectData,
      breakthroughStrategies,
      llm
    );

    // Develop attention-grabbing hooks and openers
    const attentionHooks = await developAttentionHooks(
      prospectData,
      messageTemplates,
      llm
    );

    // Create follow-up sequences
    const followUpSequences = await createFollowUpSequences(
      prospectData,
      messageTemplates,
      llm
    );

    // Generate A/B testing variations
    const messageVariations = await generateMessageVariations(
      messageTemplates,
      attentionHooks,
      llm
    );

    // Create messaging report
    const messagingReport = await createMessagingReport(
      prospectData,
      communicationAnalysis,
      breakthroughStrategies,
      messageTemplates,
      attentionHooks,
      followUpSequences,
      messageVariations,
      llm
    );

    // Upload messaging report
    const reportUrl = await uploadBuffer(
      new TextEncoder().encode(JSON.stringify(messagingReport, null, 2)),
      `lead-recon/${packet.eventId}/dm-breakthrough-messages.json`,
      "application/json"
    );

    const duration = Date.now() - startTime;
    await logAgentExecution(
      "lead-recon-dm-breakthrough",
      packet.eventId,
      { prospectData },
      { breakthroughStrategies, messageTemplates },
      duration,
      true
    );

    return {
      ...state,
      artifacts: {
        ...state.artifacts,
        leadReconDMBreakthrough: {
          reportUrl,
          breakthroughStrategies,
          messageTemplates,
          attentionHooks,
          followUpSequences,
          messageVariations,
          communicationAnalysis,
          totalMessages: messageTemplates.length,
          highImpactHooks: attentionHooks.filter((h) => h.impact === "high")
            .length,
        },
      },
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    await logAgentExecution(
      "lead-recon-dm-breakthrough",
      packet.eventId,
      { packet },
      {},
      duration,
      false,
      error instanceof Error ? error.message : "Unknown error"
    );

    return {
      ...state,
      errors: [...(state.errors || []), `Lead Recon DM Breakthrough: ${error}`],
    };
  }
}

async function extractProspectData(packet: any) {
  return {
    prospect: {
      name: packet.prospect?.name || packet.lead?.name,
      company: packet.prospect?.company || packet.lead?.company,
      role: packet.prospect?.role || packet.lead?.role,
      industry: packet.prospect?.industry || packet.lead?.industry,
      location: packet.prospect?.location || packet.lead?.location,
      email: packet.prospect?.email || packet.lead?.email,
      phone: packet.prospect?.phone || packet.lead?.phone,
      linkedin: packet.prospect?.linkedin || packet.lead?.linkedin,
    },
    company: {
      name: packet.prospect?.company || packet.lead?.company,
      size: packet.prospect?.companySize || packet.lead?.companySize,
      industry: packet.prospect?.industry || packet.lead?.industry,
      website: packet.prospect?.website || packet.lead?.website,
      recentNews: packet.prospect?.recentNews || [],
      challenges: packet.prospect?.challenges || [],
      goals: packet.prospect?.goals || [],
    },
    context: {
      source: packet.prospect?.source || packet.lead?.source,
      previousInteraction: packet.prospect?.previousInteraction || [],
      interests: packet.prospect?.interests || [],
      painPoints: packet.prospect?.painPoints || [],
      decisionMaking: packet.prospect?.decisionMaking || {},
      communicationStyle: packet.prospect?.communicationStyle || {},
    },
    business: {
      services: packet.business?.services || packet.offer?.services,
      valueProposition:
        packet.business?.valueProposition || packet.offer?.valueProposition,
      caseStudies: packet.business?.caseStudies || [],
      testimonials: packet.business?.testimonials || [],
      pricing: packet.offer?.pricing || packet.business?.pricing,
    },
  };
}

async function analyzeCommunicationPatterns(
  prospectData: any,
  llm: ChatOpenAI
) {
  const analysisPrompt = PromptTemplate.fromTemplate(`
    Analyze the communication patterns and preferences for this prospect:

    Prospect Information:
    {prospect}

    Company Context:
    {company}

    Communication Context:
    {context}

    Provide analysis of:
    1. Communication Style Preferences
    2. Preferred Communication Channels
    3. Response Patterns and Timing
    4. Language and Tone Preferences
    5. Decision-Making Communication Style
    6. Pain Point Communication Patterns
    7. Value Proposition Communication Preferences
    8. Objection Handling Communication Style
    9. Follow-up Communication Preferences
    10. Relationship Building Communication Approach

    Focus on insights that will help create breakthrough messages that resonate with this specific prospect.
  `);

  const response = await llm.invoke(
    await analysisPrompt.format({
      prospect: JSON.stringify(prospectData.prospect, null, 2),
      company: JSON.stringify(prospectData.company, null, 2),
      context: JSON.stringify(prospectData.context, null, 2),
    })
  );

  return {
    style: {
      preferred: "Professional, direct, value-focused",
      tone: "Confident but not aggressive",
      length: "Concise but comprehensive",
      format: "Structured and scannable",
    },
    channels: {
      primary: ["Email", "LinkedIn"],
      secondary: ["Phone", "Text"],
      timing: "Business hours, Tuesday-Thursday",
      frequency: "Weekly follow-ups",
    },
    patterns: {
      response: "Quick initial response, longer decision time",
      engagement: "High engagement with relevant content",
      objections: "Direct but respectful",
      decision: "Data-driven and consultative",
    },
    preferences: {
      language: "Industry-specific terminology",
      structure: "Clear value proposition upfront",
      proof: "Case studies and testimonials",
      urgency: "Moderate, not pushy",
    },
    insights: response.content as string,
  };
}

async function generateBreakthroughStrategies(
  prospectData: any,
  communicationAnalysis: any,
  llm: ChatOpenAI
) {
  const strategyPrompt = PromptTemplate.fromTemplate(`
    Generate breakthrough messaging strategies to get this prospect's attention:

    Prospect Data:
    {prospectData}

    Communication Analysis:
    {communicationAnalysis}

    Create breakthrough strategies including:
    1. Attention-Grabbing Approaches
    2. Value-First Messaging Strategies
    3. Personalization Techniques
    4. Timing and Frequency Strategies
    5. Channel-Specific Approaches
    6. Objection Prevention Strategies
    7. Trust-Building Techniques
    8. Urgency and Scarcity Strategies
    9. Social Proof Integration
    10. Follow-up and Persistence Strategies

    Focus on strategies that will break through the noise and get genuine engagement from this specific prospect.
  `);

  const response = await llm.invoke(
    await strategyPrompt.format({
      prospectData: JSON.stringify(prospectData, null, 2),
      communicationAnalysis: JSON.stringify(communicationAnalysis, null, 2),
    })
  );

  return [
    {
      name: "Value-First Approach",
      description: "Lead with immediate value and insights",
      tactics: [
        "Share relevant industry insights",
        "Provide free resources or tools",
        "Offer quick wins or assessments",
        "Demonstrate expertise through content",
      ],
      messaging: "Focus on what you can give before asking for anything",
      timing: "First contact and ongoing",
      success: "High engagement and response rates",
    },
    {
      name: "Personalized Relevance",
      description: "Highly personalized messages based on prospect research",
      tactics: [
        "Reference specific company news or events",
        "Mention mutual connections or shared experiences",
        "Address specific pain points or challenges",
        "Customize examples and case studies",
      ],
      messaging:
        "Show you've done your homework and understand their situation",
      timing: "Every message should be personalized",
      success: "Increased response and meeting rates",
    },
    {
      name: "Curiosity-Driven Hooks",
      description: "Create curiosity and intrigue without being gimmicky",
      tactics: [
        "Ask thought-provoking questions",
        "Share surprising industry statistics",
        "Present contrarian viewpoints",
        "Offer exclusive insights or data",
      ],
      messaging: "Make them want to know more",
      timing: "Subject lines and opening statements",
      success: "Higher open and response rates",
    },
    {
      name: "Social Proof Integration",
      description: "Leverage social proof and credibility",
      tactics: [
        "Share relevant case studies",
        "Mention similar company successes",
        "Reference industry recognition",
        "Include testimonials and reviews",
      ],
      messaging: "Show others like them have succeeded",
      timing: "Throughout the conversation",
      success: "Increased trust and credibility",
    },
    {
      name: "Problem-Agitation-Solution",
      description: "Agitate problems before presenting solutions",
      tactics: [
        "Identify and amplify pain points",
        "Show cost of inaction",
        "Present solution as relief",
        "Create urgency around solving problems",
      ],
      messaging: "Make the problem feel urgent and solvable",
      timing: "After establishing rapport",
      success: "Higher conversion rates",
    },
    {
      name: "Consultative Approach",
      description: "Position as consultant rather than salesperson",
      tactics: [
        "Ask discovery questions",
        "Provide strategic insights",
        "Offer free consultations",
        "Focus on their success, not your product",
      ],
      messaging: "Help them succeed, not sell to them",
      timing: "Throughout the relationship",
      success: "Longer-term relationships and higher value deals",
    },
  ];
}

async function createMessageTemplates(
  prospectData: any,
  breakthroughStrategies: any[],
  llm: ChatOpenAI
) {
  const templatePrompt = PromptTemplate.fromTemplate(`
    Create personalized message templates based on the prospect data and breakthrough strategies:

    Prospect Data:
    {prospectData}

    Breakthrough Strategies:
    {strategies}

    Create message templates for:
    1. Initial Outreach (Cold Contact)
    2. Follow-up Messages (1st, 2nd, 3rd follow-up)
    3. Value-Add Messages (Sharing insights/resources)
    4. Meeting Request Messages
    5. Post-Meeting Follow-up
    6. Objection Response Messages
    7. Re-engagement Messages
    8. Referral Request Messages

    For each template, include:
    - Subject line (for email)
    - Opening hook
    - Value proposition
    - Call to action
    - Personalization placeholders
    - Tone and style guidelines

    Make templates specific to this prospect's industry, role, and communication preferences.
  `);

  const response = await llm.invoke(
    await templatePrompt.format({
      prospectData: JSON.stringify(prospectData, null, 2),
      strategies: JSON.stringify(breakthroughStrategies, null, 2),
    })
  );

  return [
    {
      type: "Initial Outreach",
      channel: "Email",
      subject: "Quick question about [COMPANY]'s [SPECIFIC CHALLENGE]",
      template: `Hi [PROSPECT_NAME],

I noticed [SPECIFIC OBSERVATION about their company/industry] and thought you might find this interesting: [VALUE-ADD INSIGHT].

[COMPANY_NAME] seems to be [SPECIFIC OBSERVATION about their business], and I've helped similar companies in [INDUSTRY] [SPECIFIC OUTCOME].

Would you be open to a brief conversation about [SPECIFIC TOPIC]? I can share some insights that might be relevant to [SPECIFIC CHALLENGE they might be facing].

Best regards,
[YOUR_NAME]`,
      personalization: [
        "COMPANY",
        "SPECIFIC_CHALLENGE",
        "PROSPECT_NAME",
        "SPECIFIC_OBSERVATION",
      ],
      tone: "Professional, helpful, not salesy",
      cta: "Brief conversation request",
    },
    {
      type: "LinkedIn Connection",
      channel: "LinkedIn",
      subject: "Connection request with personalized message",
      template: `Hi [PROSPECT_NAME],

I saw your recent post about [SPECIFIC TOPIC] and found your insights on [SPECIFIC POINT] really valuable.

I work with [INDUSTRY] companies like [COMPANY_NAME] to [SPECIFIC VALUE PROPOSITION], and I thought you might be interested in [SPECIFIC RESOURCE/INSIGHT].

Would love to connect and share some thoughts on [RELEVANT TOPIC].

Best,
[YOUR_NAME]`,
      personalization: ["PROSPECT_NAME", "SPECIFIC_TOPIC", "COMPANY_NAME"],
      tone: "Professional, engaging, value-focused",
      cta: "Connection request",
    },
    {
      type: "Follow-up 1",
      channel: "Email",
      subject: "Following up on [ORIGINAL TOPIC]",
      template: `Hi [PROSPECT_NAME],

I wanted to follow up on my message about [ORIGINAL TOPIC].

I understand you're probably busy, but I thought you might find this [SPECIFIC RESOURCE] helpful: [LINK TO VALUABLE RESOURCE].

It's specifically relevant to [THEIR INDUSTRY/ROLE] and addresses [SPECIFIC CHALLENGE].

If you'd like to discuss how this might apply to [COMPANY_NAME], I'd be happy to share some additional insights.

Best regards,
[YOUR_NAME]`,
      personalization: ["PROSPECT_NAME", "ORIGINAL_TOPIC", "COMPANY_NAME"],
      tone: "Helpful, not pushy, value-focused",
      cta: "Resource sharing with soft CTA",
    },
    {
      type: "Value-Add Message",
      channel: "Email",
      subject: "Thought you'd find this interesting: [SPECIFIC INSIGHT]",
      template: `Hi [PROSPECT_NAME],

I came across this [SPECIFIC INSIGHT/DATA] and immediately thought of [COMPANY_NAME] because [SPECIFIC REASON].

[SHARE THE INSIGHT/DATA]

This is particularly relevant because [EXPLAIN RELEVANCE TO THEIR BUSINESS].

I've seen similar companies use this insight to [SPECIFIC OUTCOME], and I thought it might be valuable for your team.

Would you like to discuss how this might apply to your situation?

Best,
[YOUR_NAME]`,
      personalization: ["PROSPECT_NAME", "COMPANY_NAME", "SPECIFIC_INSIGHT"],
      tone: "Helpful, insightful, consultative",
      cta: "Discussion invitation",
    },
    {
      type: "Meeting Request",
      channel: "Email",
      subject: "15-minute call to discuss [SPECIFIC TOPIC]?",
      template: `Hi [PROSPECT_NAME],

Based on our conversation about [SPECIFIC TOPIC], I'd love to schedule a brief 15-minute call to discuss [SPECIFIC VALUE PROPOSITION].

I can share:
- [SPECIFIC INSIGHT 1]
- [SPECIFIC INSIGHT 2]
- [SPECIFIC INSIGHT 3]

This would be a no-pressure conversation focused on [THEIR BENEFIT], not selling.

Are you available for a quick call this week? I can work around your schedule.

Best regards,
[YOUR_NAME]`,
      personalization: ["PROSPECT_NAME", "SPECIFIC_TOPIC"],
      tone: "Professional, value-focused, low-pressure",
      cta: "Meeting request",
    },
  ];
}

async function developAttentionHooks(
  prospectData: any,
  messageTemplates: any[],
  llm: ChatOpenAI
) {
  const hooksPrompt = PromptTemplate.fromTemplate(`
    Create attention-grabbing hooks and openers for this prospect:

    Prospect Data:
    {prospectData}

    Message Templates:
    {templates}

    Generate hooks for:
    1. Subject Lines (Email)
    2. Opening Lines (Email/LinkedIn)
    3. Connection Request Messages
    4. Follow-up Openers
    5. Value-Add Openers
    6. Meeting Request Openers
    7. Re-engagement Openers
    8. Referral Request Openers

    For each hook type, create 3-5 variations that:
    - Grab attention immediately
    - Create curiosity
    - Show relevance to their business
    - Avoid being gimmicky or spammy
    - Align with their communication preferences

    Focus on hooks that will make them want to read more and respond.
  `);

  const response = await llm.invoke(
    await hooksPrompt.format({
      prospectData: JSON.stringify(prospectData, null, 2),
      templates: JSON.stringify(messageTemplates, null, 2),
    })
  );

  return [
    {
      type: "Email Subject Lines",
      impact: "high",
      hooks: [
        "Quick question about [COMPANY]'s [CHALLENGE]",
        "Thought you'd find this interesting: [INSIGHT]",
        "[INDUSTRY] companies are seeing [SPECIFIC RESULT]",
        "Following up on [ORIGINAL TOPIC]",
        "15-minute call to discuss [TOPIC]?",
      ],
      guidelines: "Keep under 50 characters, be specific, avoid spam words",
    },
    {
      type: "Email Opening Lines",
      impact: "high",
      hooks: [
        "I noticed [SPECIFIC OBSERVATION] and thought you might find this interesting...",
        "I came across [SPECIFIC INSIGHT] and immediately thought of [COMPANY]...",
        "I saw your recent [ACTIVITY] and found your insights on [TOPIC] really valuable...",
        "I've been following [COMPANY]'s work in [AREA] and wanted to share something relevant...",
        "I noticed [SPECIFIC TREND] in [INDUSTRY] and thought you'd be interested...",
      ],
      guidelines: "Be specific, show you've done research, lead with value",
    },
    {
      type: "LinkedIn Connection Messages",
      impact: "medium",
      hooks: [
        "I saw your post about [TOPIC] and found your insights valuable...",
        "I noticed we both work in [INDUSTRY] and thought we should connect...",
        "I came across your profile and was impressed by [SPECIFIC ACHIEVEMENT]...",
        "I work with [INDUSTRY] companies and thought you might find this interesting...",
        "I saw your recent [ACTIVITY] and wanted to share some thoughts...",
      ],
      guidelines: "Be genuine, show interest in their content, offer value",
    },
    {
      type: "Follow-up Openers",
      impact: "medium",
      hooks: [
        "I wanted to follow up on my message about [TOPIC]...",
        "I understand you're probably busy, but I thought you might find this helpful...",
        "I wanted to share something that might be relevant to [THEIR BUSINESS]...",
        "I came across this [RESOURCE] and thought of you...",
        "I wanted to circle back on [ORIGINAL TOPIC]...",
      ],
      guidelines: "Acknowledge their time, provide value, be respectful",
    },
    {
      type: "Value-Add Openers",
      impact: "high",
      hooks: [
        "I thought you'd find this interesting: [SPECIFIC INSIGHT]",
        "I came across this [DATA/INSIGHT] and immediately thought of [COMPANY]...",
        "I wanted to share something that might be relevant to [THEIR CHALLENGE]...",
        "I noticed [TREND] in [INDUSTRY] and thought you'd be interested...",
        "I have some insights on [TOPIC] that might be valuable for [COMPANY]...",
      ],
      guidelines: "Lead with value, be specific, show relevance",
    },
  ];
}

async function createFollowUpSequences(
  prospectData: any,
  messageTemplates: any[],
  llm: ChatOpenAI
) {
  return [
    {
      sequence: "Initial Outreach Follow-up",
      totalMessages: 5,
      timeline: "Spread over 2-3 weeks",
      messages: [
        {
          day: 0,
          type: "Initial Outreach",
          template: "Initial outreach message",
          goal: "Get initial response or engagement",
        },
        {
          day: 3,
          type: "Follow-up 1",
          template: "Value-add follow-up with resource",
          goal: "Provide value and maintain interest",
        },
        {
          day: 7,
          type: "Follow-up 2",
          template: "Different angle or insight",
          goal: "Try different approach if no response",
        },
        {
          day: 14,
          type: "Follow-up 3",
          template: "Final attempt with clear value",
          goal: "Last attempt before moving to re-engagement",
        },
        {
          day: 30,
          type: "Re-engagement",
          template: "Fresh approach with new insight",
          goal: "Re-engage with new value proposition",
        },
      ],
      success: "Response or meeting booking",
      fallback: "Move to re-engagement sequence",
    },
    {
      sequence: "Post-Meeting Follow-up",
      totalMessages: 3,
      timeline: "Within 1 week of meeting",
      messages: [
        {
          day: 0,
          type: "Thank You",
          template: "Thank you message with next steps",
          goal: "Confirm next steps and maintain momentum",
        },
        {
          day: 2,
          type: "Value Add",
          template: "Share relevant resource or insight",
          goal: "Provide additional value and stay top of mind",
        },
        {
          day: 5,
          type: "Follow-up",
          template: "Check in on progress and next steps",
          goal: "Move process forward or address concerns",
        },
      ],
      success: "Next meeting or proposal request",
      fallback: "Address objections or concerns",
    },
    {
      sequence: "Re-engagement",
      totalMessages: 3,
      timeline: "Monthly intervals",
      messages: [
        {
          day: 0,
          type: "Fresh Approach",
          template: "New angle or updated value proposition",
          goal: "Re-engage with fresh perspective",
        },
        {
          day: 30,
          type: "Industry Update",
          template: "Share relevant industry news or insights",
          goal: "Stay relevant and provide value",
        },
        {
          day: 60,
          type: "Final Attempt",
          template: "Clear value proposition with soft close",
          goal: "Final attempt before moving on",
        },
      ],
      success: "Re-engagement and interest",
      fallback: "Archive and focus on other prospects",
    },
  ];
}

async function generateMessageVariations(
  messageTemplates: any[],
  attentionHooks: any[],
  llm: ChatOpenAI
) {
  return messageTemplates.map((template) => ({
    original: template,
    variations: [
      {
        name: "Short Version",
        description: "Condensed version for busy prospects",
        changes: "Reduced length, key points only",
        useCase: "When prospect prefers brevity",
      },
      {
        name: "Long Version",
        description: "Detailed version with more context",
        changes: "Added context, examples, and details",
        useCase: "When prospect wants comprehensive information",
      },
      {
        name: "Casual Version",
        description: "More informal and conversational",
        changes: "Relaxed tone, casual language",
        useCase: "When prospect has casual communication style",
      },
      {
        name: "Formal Version",
        description: "More formal and professional",
        changes: "Formal tone, professional language",
        useCase: "When prospect prefers formal communication",
      },
      {
        name: "Urgent Version",
        description: "Creates sense of urgency",
        changes: "Added urgency elements, time-sensitive language",
        useCase: "When there's genuine urgency or deadline",
      },
    ],
  }));
}

async function createMessagingReport(
  prospectData: any,
  communicationAnalysis: any,
  breakthroughStrategies: any[],
  messageTemplates: any[],
  attentionHooks: any[],
  followUpSequences: any[],
  messageVariations: any[],
  llm: ChatOpenAI
) {
  return {
    executiveSummary: "Comprehensive DM breakthrough messaging strategy",
    prospectData,
    communicationAnalysis,
    breakthroughStrategies,
    messageTemplates,
    attentionHooks,
    followUpSequences,
    messageVariations,
    recommendations: {
      immediate: [
        "Start with value-first approach",
        "Use personalized subject lines and openers",
        "Implement follow-up sequence",
      ],
      shortTerm: [
        "Test different message variations",
        "Monitor response rates and adjust",
        "Refine based on prospect feedback",
      ],
      longTerm: [
        "Develop prospect-specific messaging",
        "Create automated follow-up systems",
        "Build prospect communication database",
      ],
    },
    successMetrics: {
      engagement: ["Open rates", "Response rates", "Meeting bookings"],
      conversion: ["Meeting attendance", "Proposal requests", "Deal closure"],
      relationship: [
        "Relationship depth",
        "Referral requests",
        "Long-term engagement",
      ],
    },
    bestPractices: [
      "Always lead with value",
      "Personalize every message",
      "Respect their time and preferences",
      "Follow up consistently but not aggressively",
      "Test and optimize based on results",
    ],
    commonMistakes: [
      "Being too salesy or pushy",
      "Not personalizing messages",
      "Following up too frequently",
      "Not providing value",
      "Using generic templates",
    ],
    generatedAt: new Date().toISOString(),
    reportVersion: "1.0",
  };
}
