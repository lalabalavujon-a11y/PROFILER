import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { createGoogleSlidesClient } from "../lib/google-slides";
import { uploadBuffer } from "../lib/storage";

const schema = z.object({
  packet: z.any(),
  artifacts: z.any().default({ deck: { providers: {} } }),
});

type GoogleDeckState = z.infer<typeof schema>;

export async function deckNode(state: GoogleDeckState) {
  const { packet } = state;
  
  // Initialize AI for content generation
  const llm = new ChatOpenAI({
    modelName: "gpt-4",
    temperature: 0.3,
    tags: ["deck-generation", "google-slides"],
  });

  // Generate deck content using AI
  const deckContent = await generateDeckContent(packet, llm);
  
  // Create Google Slides presentation
  const slidesClient = createGoogleSlidesClient();
  const presentation = await slidesClient.createPresentation({
    title: `${packet.host?.name || 'Lead Recon'} - ${packet.date}`,
    content: deckContent,
    branding: {
      colors: packet.assets?.brandingPalette || ['#1f2937', '#3b82f6', '#10b981'],
      logoUrl: packet.host?.logoUrl,
    },
  });

  // Export as PDF
  const pdfBuffer = await slidesClient.exportAsPDF(presentation.presentationId);
  
  // Upload to storage
  const pdfUrl = await uploadBuffer(
    pdfBuffer,
    `decks/${packet.eventId}/google/${presentation.presentationId}.pdf`,
    "application/pdf"
  );

  const existing = state.artifacts?.deck?.providers ?? {};
  const preferred = 
    (packet.assets?.deckProvider ?? "google") === "google" 
      ? "google" 
      : state.artifacts?.deck?.active ?? "google";

  return {
    ...state,
    artifacts: {
      ...state.artifacts,
      deck: {
        active: preferred,
        providers: {
          ...existing,
          google: {
            fileId: presentation.presentationId,
            pdfUrl,
            shareUrl: `https://docs.google.com/presentation/d/${presentation.presentationId}/edit`,
            variantTag: "google_v1",
          },
        },
      },
    },
  };
}

async function generateDeckContent(packet: any, llm: ChatOpenAI) {
  const contentPrompt = PromptTemplate.fromTemplate(`
    Create a comprehensive slide deck outline for a lead recon presentation targeting {industry} businesses.
    
    Event Details:
    - Host: {hostName}
    - Date: {eventDate}
    - Audience: {industry} ({audienceSize})
    - Offer: ${packet.offer?.tripwirePrice} for {tripwireCredits} credits
    - Bump Offer: {bumpOffer}
    
    Create 12-18 slides with the following structure:
    1. Title slide with host branding
    2. Agenda overview
    3. Problem identification (specific to {industry})
    4. Market opportunity and pain points
    5. Solution introduction (Lead Profiler + Automation)
    6. Live demo flow outline
    7. Case studies and social proof
    8. ROI calculator and value proposition
    9. Pricing and offer details
    10. Bonus materials and bump offer
    11. Call to action with affiliate link
    12. Q&A and next steps
    
    For each slide, provide:
    - Title
    - Key bullet points (3-5 per slide)
    - Speaker notes
    - Visual suggestions
    
    Keep content professional, ROI-focused, and tailored to {industry} decision makers.
    Include specific pain points and solutions relevant to lead generation and business automation.
  `);

  const content = await llm.invoke(
    await contentPrompt.format({
      industry: packet.audience?.industry || 'Business',
      hostName: packet.host?.name || 'Lead Recon Expert',
      eventDate: packet.date,
      audienceSize: packet.audience?.size || 'SMB',
      tripwireCredits: packet.offer?.tripwireCredits || 1000,
      bumpOffer: packet.offer?.bumpEnabled 
        ? `$${packet.offer.bumpPrice}/mo subscription` 
        : 'None',
    })
  );

  return parseSlideContent(content.content as string);
}

function parseSlideContent(content: string) {
  // Parse the AI-generated content into structured slide data
  const slides = [];
  const sections = content.split(/\n(?=\d+\.|Slide \d+)/);
  
  for (const section of sections) {
    if (!section.trim()) continue;
    
    const lines = section.split('\n').map(line => line.trim()).filter(Boolean);
    if (lines.length === 0) continue;
    
    const title = lines[0].replace(/^\d+\.\s*/, '').replace(/^Slide \d+:\s*/, '');
    const bulletPoints = lines.slice(1).filter(line => 
      line.startsWith('-') || line.startsWith('•') || line.startsWith('*')
    ).map(line => line.replace(/^[-•*]\s*/, ''));
    
    slides.push({
      title,
      content: bulletPoints,
      speakerNotes: `Present ${title} with focus on audience engagement and clear value proposition.`,
    });
  }
  
  return slides.length > 0 ? slides : getDefaultSlideContent();
}

function getDefaultSlideContent() {
  return [
    {
      title: "Lead Recon Mastery",
      content: ["Transform Your Lead Generation", "AI-Powered Business Intelligence", "Maximize Revenue Per Lead"],
      speakerNotes: "Welcome and introduction to the power of lead reconnaissance."
    },
    {
      title: "The Lead Generation Problem",
      content: ["90% of leads are never properly qualified", "Manual processes waste 60% of sales time", "Poor lead data costs $1M+ annually"],
      speakerNotes: "Establish the problem that resonates with the audience's pain points."
    },
    {
      title: "AI-Powered Solution",
      content: ["Automated lead scoring and segmentation", "Real-time market intelligence", "Personalized outreach at scale"],
      speakerNotes: "Present the solution with focus on automation and AI capabilities."
    },
    {
      title: "Live Demo",
      content: ["Upload lead list", "AI analysis in action", "Generated segments and messaging"],
      speakerNotes: "Demonstrate the actual product functionality."
    },
    {
      title: "Results & ROI",
      content: ["300% increase in qualified leads", "50% reduction in sales cycle", "25% improvement in conversion rates"],
      speakerNotes: "Share concrete results and social proof."
    },
    {
      title: "Special Offer",
      content: ["Limited-time pricing", "Bonus materials included", "Money-back guarantee"],
      speakerNotes: "Present the offer with urgency and value stacking."
    }
  ];
}
