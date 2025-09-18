import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

const schema = z.object({
  packet: z.any(),
  artifacts: z.any().default({}),
});

type AffiliateState = z.infer<typeof schema>;

export async function affiliateNode(state: AffiliateState) {
  const { packet, artifacts } = state;
  
  // Generate affiliate tracking links and UTM parameters
  const baseUrl = artifacts.funnel?.url || 'https://leadrecon.app';
  const affiliateId = packet.host?.affiliateId || generateAffiliateId(packet.host?.name);
  
  // Create UTM parameters for tracking
  const utmParams = {
    utm_source: 'affiliate',
    utm_medium: packet.host?.payoutModel?.toLowerCase() || 'ghl_affiliate',
    utm_campaign: `lead_recon_${packet.eventId}`,
    utm_content: packet.audience?.industry?.toLowerCase() || 'business',
    utm_term: 'lead_intelligence',
    aff_id: affiliateId,
    event_id: packet.eventId,
  };
  
  // Build affiliate link with tracking
  const affiliateLink = buildAffiliateLink(baseUrl, utmParams);
  
  // Calculate commission structure
  const commissionStructure = calculateCommissionStructure(
    packet.host?.commissionPct || 30,
    packet.offer?.tripwirePrice || 297,
    packet.offer?.bumpPrice || 99,
    packet.offer?.bumpEnabled || false
  );
  
  // Generate affiliate resources
  const affiliateResources = await generateAffiliateResources(packet, affiliateLink);

  return {
    ...state,
    artifacts: {
      ...state.artifacts,
      tracking: {
        utm: utmParams,
        affiliateLink,
        affiliateId,
        commissionStructure,
        resources: affiliateResources,
      },
    },
  };
}

function generateAffiliateId(hostName?: string): string {
  if (!hostName) return `aff_${Date.now()}`;
  
  return `aff_${hostName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
}

function buildAffiliateLink(baseUrl: string, utmParams: Record<string, string>): string {
  const url = new URL(baseUrl);
  
  Object.entries(utmParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  
  return url.toString();
}

function calculateCommissionStructure(
  commissionPct: number,
  tripwirePrice: number,
  bumpPrice: number,
  bumpEnabled: boolean
) {
  const tripwireCommission = Math.round((tripwirePrice * commissionPct) / 100);
  const bumpCommission = bumpEnabled ? Math.round((bumpPrice * commissionPct) / 100) : 0;
  
  return {
    commissionRate: commissionPct / 100,
    tripwireCommission,
    bumpCommission,
    totalPossibleCommission: tripwireCommission + bumpCommission,
    payoutModel: 'GHL_AFFILIATE', // GoHighLevel affiliate tracking
    cookieDuration: 30, // days
  };
}

async function generateAffiliateResources(packet: any, affiliateLink: string) {
  // In real implementation, this would generate:
  // - Email templates
  // - Social media posts
  // - Banner ads
  // - Video scripts
  
  const resources = {
    emailTemplates: [
      {
        subject: `🚀 Transform Your Lead Generation with AI (Special Invitation)`,
        body: `Hi {{firstName}},

I wanted to share something exciting with you...

I just discovered this AI-powered lead intelligence system that's helping businesses like yours generate 300% more qualified leads.

The creator, ${packet.host?.name || 'the expert'}, is hosting an exclusive training session for ${packet.audience?.industry || 'business'} owners.

Here's what you'll discover:
• How to score and segment leads automatically
• AI-powered personalization that converts 3x better  
• The exact system generating $10K+ in additional monthly revenue

This isn't available to everyone - only ${packet.audience?.size === 'enterprise' ? 'enterprise leaders' : 'select business owners'} are getting access.

Reserve your spot here: ${affiliateLink}

The training is completely free, but spots are limited.

Best regards,
{{yourName}}

P.S. This system is already being used by Fortune 500 companies. Don't let your competitors get ahead.`,
      },
    ],
    socialMediaPosts: [
      {
        platform: 'LinkedIn',
        content: `🎯 Game-changer for ${packet.audience?.industry || 'business'} leaders:

New AI system is helping companies identify and convert prospects with 300% better results.

${packet.host?.name || 'Industry expert'} is sharing the exact blueprint in a free training session.

If you're serious about scaling your lead generation, this is worth your time.

Details: ${affiliateLink}

#LeadGeneration #AI #BusinessGrowth #${packet.audience?.industry?.replace(/\s+/g, '') || 'Business'}`,
      },
      {
        platform: 'Facebook',
        content: `🚀 Attention ${packet.audience?.industry || 'Business'} Owners!

Tired of wasting time on unqualified leads?

This new AI system automatically:
✅ Scores your leads
✅ Creates personalized messaging  
✅ Identifies your best prospects

Free training happening soon: ${affiliateLink}

#LeadGeneration #SmallBusiness #AI`,
      },
    ],
    bannerAds: [
      {
        size: '728x90',
        headline: 'Transform Your Lead Generation with AI',
        description: `Join ${packet.host?.name || 'the expert'} for exclusive ${packet.audience?.industry || 'business'} training`,
        cta: 'Reserve Free Spot',
        link: affiliateLink,
      },
      {
        size: '300x250',
        headline: '300% More Qualified Leads',
        description: 'AI-Powered Lead Intelligence',
        cta: 'Watch Free Training',
        link: affiliateLink,
      },
    ],
    videoScripts: [
      {
        title: 'Lead Generation Breakthrough',
        script: `[HOOK - First 3 seconds]
"If you're struggling to find qualified leads for your ${packet.audience?.industry || 'business'}, this will change everything..."

[PROBLEM - 10 seconds]  
"Most businesses waste 60% of their time chasing unqualified prospects. Sound familiar?"

[SOLUTION - 15 seconds]
"${packet.host?.name || 'This expert'} has cracked the code on AI-powered lead intelligence. The results? 300% more qualified leads, 50% shorter sales cycles."

[PROOF - 10 seconds]
"Fortune 500 companies are already using this system. Now it's available to ${packet.audience?.size === 'enterprise' ? 'enterprise leaders' : 'business owners'} like you."

[CTA - 5 seconds]
"Get free access to the training at the link below. Limited spots available."

Link: ${affiliateLink}`,
      },
    ],
  };
  
  return resources;
}
