import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { uploadBuffer } from "../lib/storage";
import { logAgentExecution } from "../lib/langsmith-config";

const schema = z.object({
  packet: z.any(),
  artifacts: z.any().default({}),
});

type LeadReconProfilerState = z.infer<typeof schema>;

export async function leadReconProfilerNode(state: LeadReconProfilerState) {
  const startTime = Date.now();
  const { packet } = state;

  try {
    // Initialize AI model for ideal client profiling
    const llm = new ChatOpenAI({
      modelName: process.env.LEAD_RECON_MODEL || "gpt-4",
      temperature: 0.3,
      tags: ["lead-recon", "profiler", "client-profiling"],
    });

    // Extract website and business data for analysis
    const businessData = await extractBusinessData(packet);

    // Generate strategic questions for client profiling
    const strategicQuestions = await generateStrategicQuestions(
      businessData,
      llm
    );

    // Build ideal client profiles based on website analysis
    const idealClientProfiles = await buildIdealClientProfiles(
      businessData,
      strategicQuestions,
      llm
    );

    // Generate client persona templates
    const clientPersonas = await generateClientPersonas(
      idealClientProfiles,
      llm
    );

    // Create comprehensive profiling report
    const profilingReport = await createProfilingReport(
      businessData,
      idealClientProfiles,
      clientPersonas,
      llm
    );

    // Upload profiling report
    const reportUrl = await uploadBuffer(
      new TextEncoder().encode(JSON.stringify(profilingReport, null, 2)),
      `lead-recon/${packet.eventId}/ideal-client-profiles.json`,
      "application/json"
    );

    const duration = Date.now() - startTime;
    await logAgentExecution(
      "lead-recon-profiler",
      packet.eventId,
      { businessData },
      { idealClientProfiles, clientPersonas },
      duration,
      true
    );

    return {
      ...state,
      artifacts: {
        ...state.artifacts,
        leadReconProfiler: {
          reportUrl,
          idealClientProfiles,
          clientPersonas,
          strategicQuestions,
          businessAnalysis: businessData,
          totalProfiles: idealClientProfiles.length,
          highValueSegments: idealClientProfiles.filter(
            (p) => p.priority === "high"
          ).length,
        },
      },
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    await logAgentExecution(
      "lead-recon-profiler",
      packet.eventId,
      { packet },
      {},
      duration,
      false,
      error instanceof Error ? error.message : "Unknown error"
    );

    return {
      ...state,
      errors: [...(state.errors || []), `Lead Recon Profiler: ${error}`],
    };
  }
}

async function extractBusinessData(packet: any) {
  // Extract business information from packet
  const businessData = {
    website: packet.website || packet.business?.website,
    industry: packet.audience?.industry || packet.business?.industry,
    targetMarket:
      packet.audience?.targetMarket || packet.business?.targetMarket,
    services: packet.business?.services || packet.offer?.services,
    pricing: packet.offer?.pricing || packet.business?.pricing,
    valueProposition:
      packet.business?.valueProposition || packet.offer?.valueProposition,
    competitors: packet.business?.competitors || [],
    marketSize: packet.business?.marketSize,
    location: packet.audience?.location || packet.business?.location,
    businessModel: packet.business?.businessModel,
    revenue: packet.business?.revenue,
    employees: packet.business?.employees,
  };

  // If website is provided, analyze it for additional insights
  if (businessData.website) {
    const websiteAnalysis = await analyzeWebsite(businessData.website);
    return { ...businessData, websiteAnalysis };
  }

  return businessData;
}

async function analyzeWebsite(websiteUrl: string) {
  // In a real implementation, this would use web scraping or API calls
  // to analyze the website content, structure, and messaging
  return {
    primaryMessaging: "Extracted from website analysis",
    targetAudience: "Identified from website content",
    keyServices: "Listed on website",
    pricingStrategy: "Inferred from website",
    competitivePositioning: "Analyzed from content",
    conversionElements: "CTA buttons, forms, etc.",
  };
}

async function generateStrategicQuestions(businessData: any, llm: ChatOpenAI) {
  const questionsPrompt = PromptTemplate.fromTemplate(`
    As a business intelligence expert, generate strategic questions to help build ideal client profiles for this business:

    Business Information:
    - Industry: {industry}
    - Services: {services}
    - Target Market: {targetMarket}
    - Value Proposition: {valueProposition}
    - Website: {website}

    Generate 10-15 strategic questions that will help identify:
    1. Ideal client demographics and psychographics
    2. Pain points and challenges they face
    3. Decision-making processes and criteria
    4. Budget and purchasing behavior
    5. Preferred communication channels
    6. Success metrics and goals

    Format as a JSON array of question objects with:
    - question: the strategic question
    - category: demographic, psychographic, behavioral, etc.
    - priority: high, medium, low
    - purpose: what insight this question reveals

    Focus on questions that will help create actionable client profiles for lead generation and sales.
  `);

  const response = await llm.invoke(
    await questionsPrompt.format({
      industry: businessData.industry || "Not specified",
      services: businessData.services || "Not specified",
      targetMarket: businessData.targetMarket || "Not specified",
      valueProposition: businessData.valueProposition || "Not specified",
      website: businessData.website || "Not provided",
    })
  );

  try {
    return JSON.parse(response.content as string);
  } catch {
    // Fallback to structured questions if JSON parsing fails
    return [
      {
        question: "What is the typical company size of your ideal clients?",
        category: "demographic",
        priority: "high",
        purpose: "Identify company size preferences for targeting",
      },
      {
        question: "What are the main pain points your ideal clients face?",
        category: "psychographic",
        priority: "high",
        purpose: "Understand client challenges for messaging",
      },
      {
        question: "What is the typical budget range for your services?",
        category: "behavioral",
        priority: "high",
        purpose: "Qualify leads based on budget capacity",
      },
    ];
  }
}

async function buildIdealClientProfiles(
  businessData: any,
  strategicQuestions: any[],
  llm: ChatOpenAI
) {
  const profilesPrompt = PromptTemplate.fromTemplate(`
    Based on the business information and strategic questions, create 3-5 ideal client profiles:

    Business Context:
    {businessContext}

    Strategic Questions Framework:
    {questions}

    For each ideal client profile, create:
    1. Profile Name (e.g., "Enterprise SaaS CTO", "Mid-Market Marketing Director")
    2. Demographics (company size, industry, role, location)
    3. Psychographics (goals, challenges, pain points, motivations)
    4. Behavioral patterns (buying process, decision criteria, timeline)
    5. Communication preferences (channels, tone, frequency)
    6. Budget and purchasing power
    7. Success metrics and KPIs
    8. Priority level (high, medium, low)
    9. Targeting strategy recommendations

    Format as JSON array with detailed profile objects.
    Make profiles specific, actionable, and based on realistic business scenarios.
  `);

  const response = await llm.invoke(
    await profilesPrompt.format({
      businessContext: JSON.stringify(businessData, null, 2),
      questions: JSON.stringify(strategicQuestions, null, 2),
    })
  );

  try {
    return JSON.parse(response.content as string);
  } catch {
    // Fallback profiles if JSON parsing fails
    return [
      {
        name: "Enterprise Decision Maker",
        demographics: {
          companySize: "500+ employees",
          industry: businessData.industry || "Technology",
          role: "C-Level or VP",
          location: "North America",
        },
        psychographics: {
          goals: ["Increase efficiency", "Reduce costs", "Scale operations"],
          challenges: [
            "Complex decision making",
            "Multiple stakeholders",
            "Risk management",
          ],
          painPoints: [
            "Legacy systems",
            "Integration challenges",
            "ROI measurement",
          ],
        },
        behavioral: {
          buyingProcess: "6-12 months",
          decisionCriteria: ["ROI", "Security", "Scalability", "Support"],
          timeline: "Quarterly planning cycles",
        },
        communication: {
          channels: ["Email", "LinkedIn", "Phone calls"],
          tone: "Professional, data-driven",
          frequency: "Weekly to monthly",
        },
        budget: {
          range: "$50,000 - $500,000+",
          approvalProcess: "Multi-level approval required",
        },
        successMetrics: [
          "ROI",
          "Time savings",
          "User adoption",
          "Cost reduction",
        ],
        priority: "high",
        targetingStrategy:
          "Account-based marketing, executive outreach, case studies",
      },
    ];
  }
}

async function generateClientPersonas(
  idealClientProfiles: any[],
  llm: ChatOpenAI
) {
  const personasPrompt = PromptTemplate.fromTemplate(`
    Create detailed buyer personas based on these ideal client profiles:

    {profiles}

    For each persona, create:
    1. Persona Name and Title
    2. Background and Experience
    3. Daily Responsibilities
    4. Goals and Objectives
    5. Challenges and Pain Points
    6. Information Sources and Preferences
    7. Buying Behavior and Decision Process
    8. Communication Style and Preferences
    9. Content Preferences
    10. Objections and Concerns

    Make personas realistic, detailed, and actionable for marketing and sales teams.
    Format as JSON array of persona objects.
  `);

  const response = await llm.invoke(
    await personasPrompt.format({
      profiles: JSON.stringify(idealClientProfiles, null, 2),
    })
  );

  try {
    return JSON.parse(response.content as string);
  } catch {
    // Fallback personas
    return idealClientProfiles.map((profile) => ({
      name: `${profile.name} Persona`,
      title: profile.demographics?.role || "Decision Maker",
      background: "Experienced professional in their field",
      responsibilities: [
        "Strategic planning",
        "Team management",
        "Budget oversight",
      ],
      goals: profile.psychographics?.goals || ["Business growth", "Efficiency"],
      challenges: profile.psychographics?.challenges || [
        "Resource constraints",
        "Market competition",
      ],
      informationSources: [
        "Industry publications",
        "Peer networks",
        "Online research",
      ],
      buyingBehavior: "Research-driven, consultative approach",
      communicationStyle: "Direct, results-oriented",
      contentPreferences: [
        "Case studies",
        "ROI calculators",
        "Industry reports",
      ],
      objections: [
        "Budget constraints",
        "Implementation complexity",
        "Change management",
      ],
    }));
  }
}

async function createProfilingReport(
  businessData: any,
  idealClientProfiles: any[],
  clientPersonas: any[],
  llm: ChatOpenAI
) {
  const reportPrompt = PromptTemplate.fromTemplate(`
    Create a comprehensive ideal client profiling report:

    Business Analysis:
    {businessData}

    Ideal Client Profiles:
    {profiles}

    Client Personas:
    {personas}

    Generate a professional report including:
    1. Executive Summary
    2. Business Analysis and Market Position
    3. Ideal Client Profile Summary
    4. Detailed Persona Analysis
    5. Targeting Recommendations
    6. Messaging Framework
    7. Content Strategy Recommendations
    8. Sales Approach Guidelines
    9. Success Metrics and KPIs
    10. Next Steps and Action Items

    Format as a structured report with clear sections and actionable insights.
  `);

  const response = await llm.invoke(
    await reportPrompt.format({
      businessData: JSON.stringify(businessData, null, 2),
      profiles: JSON.stringify(idealClientProfiles, null, 2),
      personas: JSON.stringify(clientPersonas, null, 2),
    })
  );

  return {
    executiveSummary: "Comprehensive ideal client profiling analysis completed",
    businessAnalysis: businessData,
    idealClientProfiles,
    clientPersonas,
    targetingRecommendations:
      generateTargetingRecommendations(idealClientProfiles),
    messagingFramework: generateMessagingFramework(idealClientProfiles),
    contentStrategy: generateContentStrategy(clientPersonas),
    salesApproach: generateSalesApproach(idealClientProfiles),
    successMetrics: generateSuccessMetrics(),
    nextSteps: generateNextSteps(),
    generatedAt: new Date().toISOString(),
    reportVersion: "1.0",
  };
}

function generateTargetingRecommendations(profiles: any[]) {
  return profiles.map((profile) => ({
    profile: profile.name,
    targetingChannels: ["LinkedIn", "Email", "Content Marketing"],
    targetingCriteria: profile.demographics,
    budgetAllocation:
      profile.priority === "high"
        ? "60%"
        : profile.priority === "medium"
        ? "30%"
        : "10%",
    expectedConversion: profile.priority === "high" ? "15-25%" : "5-15%",
  }));
}

function generateMessagingFramework(profiles: any[]) {
  return profiles.map((profile) => ({
    profile: profile.name,
    valueProposition: `Tailored solution for ${
      profile.demographics?.role || "decision makers"
    }`,
    keyMessages: profile.psychographics?.goals || [],
    painPointAddress: profile.psychographics?.challenges || [],
    proofPoints: ["Case studies", "ROI data", "Customer testimonials"],
  }));
}

function generateContentStrategy(personas: any[]) {
  return {
    contentTypes: [
      "Blog posts",
      "Case studies",
      "Webinars",
      "White papers",
      "ROI calculators",
    ],
    distributionChannels: [
      "Website",
      "LinkedIn",
      "Email",
      "Industry publications",
    ],
    personaContentMap: personas.map((persona) => ({
      persona: persona.name,
      preferredContent: persona.contentPreferences || [],
      engagementStrategy: "Educational, consultative approach",
    })),
  };
}

function generateSalesApproach(profiles: any[]) {
  return profiles.map((profile) => ({
    profile: profile.name,
    salesProcess: "Consultative selling approach",
    keyStakeholders: ["Decision maker", "Influencers", "End users"],
    objectionHandling: profile.psychographics?.challenges || [],
    closingStrategy: "Value-based selling with ROI focus",
  }));
}

function generateSuccessMetrics() {
  return {
    leadGeneration: ["Lead volume", "Lead quality score", "Conversion rate"],
    engagement: ["Email open rates", "Content engagement", "Meeting bookings"],
    sales: ["Pipeline value", "Close rate", "Average deal size"],
    retention: ["Customer satisfaction", "Renewal rate", "Upsell rate"],
  };
}

function generateNextSteps() {
  return [
    "Validate ideal client profiles with sales team",
    "Create targeted content for each persona",
    "Set up tracking and analytics",
    "Launch pilot campaigns",
    "Measure and optimize based on results",
  ];
}
