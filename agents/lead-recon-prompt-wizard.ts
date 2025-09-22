import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { uploadBuffer } from "../lib/storage";
import { logAgentExecution } from "../lib/langsmith-config";

const schema = z.object({
  packet: z.any(),
  artifacts: z.any().default({}),
});

type LeadReconPromptWizardState = z.infer<typeof schema>;

export async function leadReconPromptWizardNode(
  state: LeadReconPromptWizardState
) {
  const startTime = Date.now();
  const { packet } = state;

  try {
    // Initialize AI model for prompt generation
    const llm = new ChatOpenAI({
      modelName: process.env.LEAD_RECON_MODEL || "gpt-4",
      temperature: 0.3,
      tags: ["lead-recon", "prompt-wizard", "ai-prompts"],
    });

    // Extract user intent and requirements
    const userIntent = await extractUserIntent(packet);

    // Analyze the user's request and determine required variables
    const variableAnalysis = await analyzeRequiredVariables(userIntent, llm);

    // Generate the AI prompt based on user intent
    const generatedPrompt = await generateAIPrompt(
      userIntent,
      variableAnalysis,
      llm
    );

    // Create prompt variations for different use cases
    const promptVariations = await createPromptVariations(
      userIntent,
      generatedPrompt,
      llm
    );

    // Generate prompt templates for common scenarios
    const promptTemplates = await generatePromptTemplates(
      userIntent,
      variableAnalysis,
      llm
    );

    // Create prompt optimization suggestions
    const optimizationSuggestions = await createOptimizationSuggestions(
      generatedPrompt,
      userIntent,
      llm
    );

    // Generate comprehensive prompt report
    const promptReport = await createPromptReport(
      userIntent,
      variableAnalysis,
      generatedPrompt,
      promptVariations,
      promptTemplates,
      optimizationSuggestions,
      llm
    );

    // Upload prompt report
    const reportUrl = await uploadBuffer(
      new TextEncoder().encode(JSON.stringify(promptReport, null, 2)),
      `lead-recon/${packet.eventId}/prompt-wizard-report.json`,
      "application/json"
    );

    const duration = Date.now() - startTime;
    await logAgentExecution(
      "lead-recon-prompt-wizard",
      packet.eventId,
      { userIntent },
      { generatedPrompt, promptVariations },
      duration,
      true
    );

    return {
      ...state,
      artifacts: {
        ...state.artifacts,
        leadReconPromptWizard: {
          reportUrl,
          generatedPrompt,
          promptVariations,
          promptTemplates,
          optimizationSuggestions,
          variableAnalysis,
          userIntent,
          totalPrompts: promptVariations.length + promptTemplates.length,
          readyToUse: true,
        },
      },
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    await logAgentExecution(
      "lead-recon-prompt-wizard",
      packet.eventId,
      { packet },
      {},
      duration,
      false,
      error instanceof Error ? error.message : "Unknown error"
    );

    return {
      ...state,
      errors: [...(state.errors || []), `Lead Recon Prompt Wizard: ${error}`],
    };
  }
}

async function extractUserIntent(packet: any) {
  return {
    userRequest:
      packet.userRequest ||
      packet.intent ||
      "Generate AI prompt for lead prospecting",
    useCase: packet.useCase || "general",
    context: {
      leadData: packet.leadData || {},
      website: packet.website || packet.leadData?.website,
      companyName: packet.companyName || packet.leadData?.companyName,
      contactPerson: packet.contactPerson || packet.leadData?.contactPerson,
      linkedinUrl: packet.linkedinUrl || packet.leadData?.linkedinUrl,
      peopleInfo: packet.peopleInfo || packet.leadData?.peopleInfo,
      influencerName: packet.influencerName || packet.leadData?.influencerName,
      influencerProfile:
        packet.influencerProfile || packet.leadData?.influencerProfile,
      influencerInfo: packet.influencerInfo || packet.leadData?.influencerInfo,
    },
    requirements: {
      promptType: packet.promptType || "general",
      complexity: packet.complexity || "medium",
      variables: packet.requiredVariables || [],
      tone: packet.tone || "professional",
      length: packet.promptLength || "medium",
    },
    examples: packet.examples || [],
  };
}

async function analyzeRequiredVariables(userIntent: any, llm: ChatOpenAI) {
  const analysisPrompt = PromptTemplate.fromTemplate(`
    Analyze the user's request and determine which Lead Recon Pro variables are needed:

    User Request: {userRequest}
    Use Case: {useCase}
    Context: {context}

    Available Variables:
    - #website → The lead's website
    - #companyName → The name of the company
    - #contactPerson → The name of the lead or decision-maker
    - #linkedinUrl → The URL of the person's LinkedIn Profile
    - #peopleInfo → The information about the person from their LinkedIn profile
    - #influencerName → The name of the Influencer
    - #influencerProfile → The information the influencer has added to their profile
    - #influencerInfo → The information about the influencer

    Determine:
    1. Which variables are relevant for this request
    2. The priority/importance of each variable
    3. How each variable should be used in the prompt
    4. Any additional context needed

    Return as JSON with variable analysis.
  `);

  const response = await llm.invoke(
    await analysisPrompt.format({
      userRequest: userIntent.userRequest,
      useCase: userIntent.useCase,
      context: JSON.stringify(userIntent.context, null, 2),
    })
  );

  try {
    return JSON.parse(response.content as string);
  } catch {
    // Fallback analysis based on user request
    const variables = [];
    const request = userIntent.userRequest.toLowerCase();

    if (
      request.includes("website") ||
      request.includes("seo") ||
      request.includes("landing page")
    ) {
      variables.push({
        name: "#website",
        priority: "high",
        usage: "Primary data source",
      });
    }
    if (request.includes("company") || request.includes("business")) {
      variables.push({
        name: "#companyName",
        priority: "high",
        usage: "Company identification",
      });
    }
    if (
      request.includes("contact") ||
      request.includes("person") ||
      request.includes("outreach") ||
      request.includes("message")
    ) {
      variables.push({
        name: "#contactPerson",
        priority: "high",
        usage: "Personalization",
      });
    }
    if (request.includes("linkedin") || request.includes("social")) {
      variables.push({
        name: "#linkedinUrl",
        priority: "medium",
        usage: "Social media context",
      });
      variables.push({
        name: "#peopleInfo",
        priority: "medium",
        usage: "Profile information",
      });
    }
    if (request.includes("influencer")) {
      variables.push({
        name: "#influencerName",
        priority: "high",
        usage: "Influencer identification",
      });
      variables.push({
        name: "#influencerProfile",
        priority: "high",
        usage: "Influencer profile data",
      });
      variables.push({
        name: "#influencerInfo",
        priority: "medium",
        usage: "Additional influencer context",
      });
    }

    return {
      requiredVariables: variables,
      analysis: "Based on request keywords and context",
      recommendations: "Use only relevant variables to keep prompt focused",
    };
  }
}

async function generateAIPrompt(
  userIntent: any,
  variableAnalysis: any,
  llm: ChatOpenAI
) {
  const promptGenerationPrompt = PromptTemplate.fromTemplate(`
    Generate a clean, specific AI prompt for Lead Recon Pro based on the user's request:

    User Request: {userRequest}
    Use Case: {useCase}
    Required Variables: {variables}
    Tone: {tone}
    Complexity: {complexity}

    Requirements:
    1. Use direct, actionable language
    2. Include only relevant variables from the analysis
    3. Make it copy-paste ready for Lead Recon Pro
    4. Avoid excessive formality
    5. Focus on specific, actionable outcomes
    6. Do not include variable definitions in the output

    Generate a single, optimized prompt that the user can immediately use.
  `);

  const response = await llm.invoke(
    await promptGenerationPrompt.format({
      userRequest: userIntent.userRequest,
      useCase: userIntent.useCase,
      variables: JSON.stringify(
        variableAnalysis.requiredVariables || [],
        null,
        2
      ),
      tone: userIntent.requirements.tone,
      complexity: userIntent.requirements.complexity,
    })
  );

  return {
    prompt: response.content as string,
    variables: variableAnalysis.requiredVariables || [],
    useCase: userIntent.useCase,
    generatedAt: new Date().toISOString(),
  };
}

async function createPromptVariations(
  userIntent: any,
  generatedPrompt: any,
  llm: ChatOpenAI
) {
  const variationsPrompt = PromptTemplate.fromTemplate(`
    Create 3-5 variations of this AI prompt for different scenarios:

    Original Prompt: {originalPrompt}
    User Request: {userRequest}
    Use Case: {useCase}

    Create variations for:
    1. Different complexity levels (simple, medium, advanced)
    2. Different tones (professional, casual, urgent)
    3. Different focus areas (analysis, outreach, research)
    4. Different target audiences (decision makers, influencers, general contacts)

    Each variation should be:
    - Copy-paste ready
    - Use appropriate variables
    - Maintain the core intent
    - Be optimized for different use cases

    Return as JSON array of prompt variations.
  `);

  const response = await llm.invoke(
    await variationsPrompt.format({
      originalPrompt: generatedPrompt.prompt,
      userRequest: userIntent.userRequest,
      useCase: userIntent.useCase,
    })
  );

  try {
    return JSON.parse(response.content as string);
  } catch {
    // Fallback variations
    return [
      {
        name: "Simple Version",
        prompt: generatedPrompt.prompt.replace(
          /complex|detailed|comprehensive/gi,
          "simple"
        ),
        useCase: "Quick analysis",
        complexity: "simple",
      },
      {
        name: "Advanced Version",
        prompt:
          generatedPrompt.prompt +
          " Provide detailed analysis with specific recommendations and actionable next steps.",
        useCase: "Comprehensive analysis",
        complexity: "advanced",
      },
      {
        name: "Casual Tone",
        prompt: generatedPrompt.prompt.replace(
          /analyze|evaluate|assess/gi,
          "check out"
        ),
        useCase: "Informal outreach",
        tone: "casual",
      },
    ];
  }
}

async function generatePromptTemplates(
  userIntent: any,
  variableAnalysis: any,
  llm: ChatOpenAI
) {
  return [
    {
      name: "Website Analysis",
      category: "Analysis",
      prompt:
        "Analyze the website: #website and provide insights on their current strategy, identify 3 key improvement opportunities, and suggest specific actions they could take.",
      variables: ["#website"],
      useCase: "Website evaluation and improvement suggestions",
    },
    {
      name: "Cold Outreach Message",
      category: "Outreach",
      prompt:
        "Write a personalized cold outreach message to #contactPerson at #companyName. Reference something specific from their website (#website) and focus on how we can help them achieve their business goals.",
      variables: ["#contactPerson", "#companyName", "#website"],
      useCase: "Initial prospect contact",
    },
    {
      name: "LinkedIn Icebreaker",
      category: "Social Media",
      prompt:
        "Create a personalized LinkedIn icebreaker for #contactPerson at #companyName based on insights from their website: #website. Make it engaging and relevant to their business.",
      variables: ["#contactPerson", "#companyName", "#website"],
      useCase: "LinkedIn connection and engagement",
    },
    {
      name: "Content Strategy Analysis",
      category: "Content",
      prompt:
        "Review the website #website and analyze their content marketing strategy. Identify what content types they use, their likely target audience, and suggest 3 ways to improve engagement and lead generation.",
      variables: ["#website"],
      useCase: "Content marketing evaluation",
    },
    {
      name: "Follow-up Message",
      category: "Follow-up",
      prompt:
        "Draft a follow-up message for #contactPerson at #companyName thanking them for their interest. Mention their company's website (#website) and include a relevant offer based on their business needs.",
      variables: ["#contactPerson", "#companyName", "#website"],
      useCase: "Post-meeting or post-webinar follow-up",
    },
    {
      name: "Influencer Outreach",
      category: "Influencer",
      prompt:
        "Create a personalized outreach message to #influencerName based on their profile (#influencerProfile) and background (#influencerInfo). Focus on collaboration opportunities that align with their interests and audience.",
      variables: ["#influencerName", "#influencerProfile", "#influencerInfo"],
      useCase: "Influencer partnership and collaboration",
    },
    {
      name: "SEO Analysis",
      category: "SEO",
      prompt:
        "Analyze the SEO performance of #website and provide 5 specific recommendations to improve their search rankings, organic traffic, and online visibility.",
      variables: ["#website"],
      useCase: "SEO audit and improvement",
    },
    {
      name: "Competitive Analysis",
      category: "Research",
      prompt:
        "Research #companyName and their website (#website) to identify their main competitors, market positioning, and 3 strategic opportunities they could leverage.",
      variables: ["#companyName", "#website"],
      useCase: "Competitive intelligence and market research",
    },
  ];
}

async function createOptimizationSuggestions(
  generatedPrompt: any,
  userIntent: any,
  llm: ChatOpenAI
) {
  return {
    clarity: [
      "Use specific, actionable language",
      "Avoid vague terms like 'analyze' or 'evaluate' without context",
      "Include clear success criteria or expected outcomes",
    ],
    variables: [
      "Only include variables that are relevant to the task",
      "Use variables in natural, contextual ways",
      "Avoid forcing variables where they don't add value",
    ],
    structure: [
      "Start with the main action or request",
      "Provide context and background information",
      "End with specific deliverables or next steps",
    ],
    effectiveness: [
      "Focus on one primary objective per prompt",
      "Include specific metrics or criteria when possible",
      "Make the prompt scannable and easy to understand",
    ],
    customization: [
      "Adapt the tone to match your brand voice",
      "Include industry-specific terminology when relevant",
      "Consider the recipient's role and expertise level",
    ],
    examples: [
      "Instead of: 'Analyze the website'",
      "Use: 'Review the website and identify 3 specific improvement opportunities'",
      "Instead of: 'Write a message'",
      "Use: 'Write a personalized outreach message that references their recent blog post about...'",
    ],
  };
}

async function createPromptReport(
  userIntent: any,
  variableAnalysis: any,
  generatedPrompt: any,
  promptVariations: any[],
  promptTemplates: any[],
  optimizationSuggestions: any,
  llm: ChatOpenAI
) {
  return {
    executiveSummary: "AI prompt generation for Lead Recon Pro prospecting",
    userIntent,
    variableAnalysis,
    generatedPrompt,
    promptVariations,
    promptTemplates,
    optimizationSuggestions,
    recommendations: {
      immediate: [
        "Use the generated prompt as your primary prompt",
        "Test the prompt with sample data to ensure it works as expected",
        "Customize the tone and complexity based on your needs",
      ],
      shortTerm: [
        "Try different variations to see which performs best",
        "Use the prompt templates for common scenarios",
        "Apply optimization suggestions to improve effectiveness",
      ],
      longTerm: [
        "Build a library of proven prompts for different use cases",
        "Track prompt performance and iterate based on results",
        "Develop industry-specific prompt variations",
      ],
    },
    bestPractices: [
      "Always test prompts with sample data before using",
      "Keep prompts focused on one primary objective",
      "Use variables naturally and contextually",
      "Include specific success criteria when possible",
      "Adapt prompts based on your brand voice and audience",
    ],
    commonMistakes: [
      "Using too many variables unnecessarily",
      "Creating overly complex or vague prompts",
      "Not testing prompts before deployment",
      "Ignoring the context of the recipient",
      "Using generic language instead of specific, actionable terms",
    ],
    successMetrics: {
      promptEffectiveness: [
        "Response quality",
        "Task completion",
        "User satisfaction",
      ],
      variableUsage: ["Relevance", "Contextual fit", "Value added"],
      promptPerformance: ["Execution time", "Output quality", "Error rate"],
    },
    generatedAt: new Date().toISOString(),
    reportVersion: "1.0",
  };
}
