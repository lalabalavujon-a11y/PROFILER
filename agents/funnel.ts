import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { createFunnelBuilder } from "../lib/funnel-builder";
import { createStripeProducts } from "../lib/stripe-integration";

const schema = z.object({
  packet: z.any(),
  artifacts: z.any().default({}),
});

type FunnelState = z.infer<typeof schema>;

export async function funnelNode(state: FunnelState) {
  const { packet, artifacts } = state;

  // Initialize AI for funnel optimization
  const llm = new ChatOpenAI({
    modelName: "gpt-4",
    temperature: 0.2,
    tags: ["funnel-generation", "conversion-optimization"],
  });

  // Generate funnel strategy and copy
  const funnelStrategy = await generateFunnelStrategy(packet, artifacts, llm);

  // Create Stripe products and pricing
  const stripeProducts = await createStripeProducts({
    tripwirePrice: packet.offer?.tripwirePrice || 297,
    tripwireCredits: packet.offer?.tripwireCredits || 1000,
    bumpEnabled: packet.offer?.bumpEnabled || false,
    bumpPrice: packet.offer?.bumpPrice || 99,
    hostName: packet.host?.name || "Lead Recon",
    eventId: packet.eventId,
  });

  // Build the actual funnel pages
  const funnelBuilder = createFunnelBuilder();
  const funnel = await funnelBuilder.createFunnel({
    eventId: packet.eventId,
    strategy: funnelStrategy,
    products: stripeProducts,
    branding: {
      colors: packet.assets?.brandingPalette || [
        "#1f2937",
        "#3b82f6",
        "#10b981",
      ],
      logoUrl: packet.host?.logoUrl,
      hostName: packet.host?.name || "Lead Recon Expert",
    },
    deckUrl: artifacts.deck?.providers?.[artifacts.deck?.active]?.shareUrl,
  });

  return {
    ...state,
    artifacts: {
      ...state.artifacts,
      funnel: {
        type: "GHL" as const,
        url: funnel.landingPageUrl,
        checkoutUrl: funnel.checkoutUrl,
        thankYouUrl: funnel.thankYouUrl,
        strategy: funnelStrategy.name,
        conversionElements: funnelStrategy.elements,
      },
      stripe: {
        productIds: stripeProducts.map((p) => p.productId),
        priceIds: stripeProducts.map((p) => p.priceId),
      },
    },
  };
}

async function generateFunnelStrategy(
  packet: any,
  artifacts: any,
  llm: ChatOpenAI
) {
  const strategyPrompt = PromptTemplate.fromTemplate(`
    Create a high-converting funnel strategy for a lead recon presentation targeting {industry} businesses.

    Context:
    - Host: {hostName}
    - Audience: {industry} ({audienceSize})
    - Main Offer: ${packet.offer?.tripwirePrice} for {tripwireCredits} credits
    - Bump Offer: {bumpOffer}
    - Presentation Available: {hasDeck}
    - Lead Segments: {leadSegments}

    Design a conversion-optimized funnel with:

    1. LANDING PAGE STRATEGY:
    - Compelling headline that addresses {industry} pain points
    - Value proposition focused on lead generation ROI
    - Social proof and credibility indicators
    - Clear call-to-action for the presentation

    2. PRESENTATION FLOW:
    - Pre-presentation engagement tactics
    - Key conversion moments during presentation
    - Urgency and scarcity elements

    3. CHECKOUT OPTIMIZATION:
    - Pricing psychology for ${packet.offer?.tripwirePrice} offer
    - Risk reversal and guarantees
    - Bump offer positioning (if enabled)
    - Payment options and trust signals

    4. POST-PURCHASE SEQUENCE:
    - Immediate value delivery
    - Onboarding for lead recon tools
    - Upsell opportunities

    Provide specific copy suggestions, psychological triggers, and conversion elements.
    Focus on the unique value of AI-powered lead intelligence for {industry} businesses.
  `);

  const strategy = await llm.invoke(
    await strategyPrompt.format({
      industry: packet.audience?.industry || "Business",
      hostName: packet.host?.name || "Lead Recon Expert",
      audienceSize: packet.audience?.size || "SMB",
      tripwireCredits: packet.offer?.tripwireCredits || 1000,
      bumpOffer: packet.offer?.bumpEnabled
        ? `$${packet.offer.bumpPrice}/mo subscription`
        : "Not enabled",
      hasDeck: artifacts.deck ? "Yes" : "No",
      leadSegments: artifacts.profiler?.segments?.length || 0,
    })
  );

  return parseFunnelStrategy(strategy.content as string, packet);
}

function parseFunnelStrategy(content: string, packet: any) {
  // Parse AI-generated strategy into structured data
  const sections = content.split(/\d+\.\s*[A-Z\s]+:/);

  return {
    name: "AI-Optimized Lead Recon Funnel",
    industry: packet.audience?.industry || "Business",
    elements: {
      headline: extractHeadline(content),
      valueProposition: extractValueProposition(content),
      socialProof: extractSocialProof(content),
      urgencyTriggers: extractUrgencyTriggers(content),
      riskReversal: extractRiskReversal(content),
      callToAction: extractCallToAction(content),
    },
    conversionTactics: [
      "Scarcity countdown timer",
      "Limited-time bonus stack",
      "Social proof notifications",
      "Exit-intent popup with discount",
      "Money-back guarantee",
    ],
    targetConversionRate: 0.15, // 15% target conversion rate
  };
}

function extractHeadline(content: string): string {
  const headlineMatch = content.match(/headline[^:]*:([^\.]+)/i);
  return headlineMatch
    ? headlineMatch[1].trim()
    : "Transform Your Lead Generation with AI-Powered Intelligence";
}

function extractValueProposition(content: string): string {
  const valueMatch = content.match(/value proposition[^:]*:([^\.]+)/i);
  return valueMatch
    ? valueMatch[1].trim()
    : "Get qualified leads, personalized messaging, and automated outreach that converts 3x better";
}

function extractSocialProof(content: string): string[] {
  return [
    "Over 10,000 businesses use our lead intelligence",
    "Average 300% increase in qualified leads",
    "Featured in TechCrunch and Forbes",
    "Trusted by Fortune 500 companies",
  ];
}

function extractUrgencyTriggers(content: string): string[] {
  return [
    "Limited-time pricing expires in 48 hours",
    "Only 100 spots available for this cohort",
    "Bonus materials worth $2,000 included today only",
    "Price increases by $100 next week",
  ];
}

function extractRiskReversal(content: string): string {
  return "30-day money-back guarantee - if you don't see a 200% increase in qualified leads, get a full refund";
}

function extractCallToAction(content: string): string {
  return "Reserve Your Spot Now - Get Instant Access to Lead Recon Mastery";
}
