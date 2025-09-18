import { ScoredLead } from "./lead-scorer";

export interface LeadSegment {
  name: string;
  leads: ScoredLead[];
  characteristics: string[];
  priority: 'high' | 'medium' | 'low';
  personalizedMessaging?: string;
  recommendedChannels: string[];
  estimatedConversionRate: number;
}

export interface SegmentationConfig {
  industry?: string;
  size?: string;
  location?: string;
  minSegmentSize?: number;
  maxSegments?: number;
}

export async function generateLeadSegments(
  scoredLeads: ScoredLead[],
  config: SegmentationConfig = {}
): Promise<LeadSegment[]> {
  const {
    minSegmentSize = 5,
    maxSegments = 8,
  } = config;

  const segments: LeadSegment[] = [];

  // High-value enterprise segment
  const enterpriseLeads = scoredLeads.filter(
    lead => lead.segment === 'Enterprise' && lead.score > 0.7
  );
  if (enterpriseLeads.length >= minSegmentSize) {
    segments.push({
      name: 'High-Value Enterprise',
      leads: enterpriseLeads,
      characteristics: [
        'Large revenue ($10M+)',
        'High employee count (500+)',
        'Strong engagement signals',
        'Enterprise-grade needs'
      ],
      priority: 'high',
      recommendedChannels: ['direct-sales', 'linkedin', 'account-based-marketing'],
      estimatedConversionRate: 0.15,
    });
  }

  // SMB growth companies
  const smbGrowthLeads = scoredLeads.filter(
    lead => lead.segment === 'SMB' && 
            lead.score > 0.6 && 
            ['SaaS', 'E-commerce', 'Agency'].includes(lead.industry)
  );
  if (smbGrowthLeads.length >= minSegmentSize) {
    segments.push({
      name: 'SMB Growth Companies',
      leads: smbGrowthLeads,
      characteristics: [
        'Mid-market revenue ($1M-$10M)',
        'Growth-oriented industries',
        'Technology adoption mindset',
        'Scaling challenges'
      ],
      priority: 'high',
      recommendedChannels: ['email', 'webinar', 'content-marketing'],
      estimatedConversionRate: 0.12,
    });
  }

  // Tech-savvy startups
  const startupLeads = scoredLeads.filter(
    lead => lead.segment === 'Startup' && 
            lead.score > 0.5 &&
            ['SaaS', 'E-commerce'].includes(lead.industry)
  );
  if (startupLeads.length >= minSegmentSize) {
    segments.push({
      name: 'Tech-Savvy Startups',
      leads: startupLeads,
      characteristics: [
        'Early-stage companies',
        'Tech-forward industries',
        'Budget-conscious',
        'Quick decision makers'
      ],
      priority: 'medium',
      recommendedChannels: ['email', 'social-media', 'product-led-growth'],
      estimatedConversionRate: 0.08,
    });
  }

  // Consulting and agencies
  const consultingLeads = scoredLeads.filter(
    lead => ['Consulting', 'Agency'].includes(lead.industry) && lead.score > 0.5
  );
  if (consultingLeads.length >= minSegmentSize) {
    segments.push({
      name: 'Consulting & Agencies',
      leads: consultingLeads,
      characteristics: [
        'Service-based businesses',
        'Client management focus',
        'Efficiency and automation needs',
        'Relationship-driven'
      ],
      priority: 'medium',
      recommendedChannels: ['referral', 'partnership', 'linkedin'],
      estimatedConversionRate: 0.10,
    });
  }

  // Geographic segments for international markets
  const internationalLeads = scoredLeads.filter(
    lead => !['US', 'CA'].includes(lead.location) && lead.score > 0.4
  );
  if (internationalLeads.length >= minSegmentSize) {
    segments.push({
      name: 'International Markets',
      leads: internationalLeads,
      characteristics: [
        'Non-North American markets',
        'Different time zones',
        'Potential compliance considerations',
        'Currency and payment preferences'
      ],
      priority: 'low',
      recommendedChannels: ['email', 'localized-content', 'regional-partners'],
      estimatedConversionRate: 0.06,
    });
  }

  // Recent high-engagement leads
  const recentEngagedLeads = scoredLeads.filter(
    lead => {
      const daysSinceActivity = Math.floor(
        (Date.now() - lead.lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceActivity < 7 && lead.engagementScore > 0.7;
    }
  );
  if (recentEngagedLeads.length >= minSegmentSize) {
    segments.push({
      name: 'Hot Prospects',
      leads: recentEngagedLeads,
      characteristics: [
        'Recent high engagement',
        'Active within last week',
        'Strong interest signals',
        'Ready for immediate outreach'
      ],
      priority: 'high',
      recommendedChannels: ['phone', 'direct-email', 'immediate-follow-up'],
      estimatedConversionRate: 0.20,
    });
  }

  // Low-engagement nurture segment
  const nurturingLeads = scoredLeads.filter(
    lead => lead.score < 0.5 && lead.score > 0.2
  );
  if (nurturingLeads.length >= minSegmentSize) {
    segments.push({
      name: 'Nurturing Pipeline',
      leads: nurturingLeads,
      characteristics: [
        'Lower engagement scores',
        'Potential for future conversion',
        'Need education and trust building',
        'Long-term relationship building'
      ],
      priority: 'low',
      recommendedChannels: ['newsletter', 'educational-content', 'drip-campaigns'],
      estimatedConversionRate: 0.04,
    });
  }

  // Sort segments by priority and lead count
  const sortedSegments = segments
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.leads.length - a.leads.length;
    })
    .slice(0, maxSegments);

  // Add segment assignment to leads
  for (const segment of sortedSegments) {
    for (const lead of segment.leads) {
      lead.segment = segment.name;
    }
  }

  return sortedSegments;
}

export function getSegmentInsights(segments: LeadSegment[]) {
  const totalLeads = segments.reduce((sum, segment) => sum + segment.leads.length, 0);
  const weightedConversionRate = segments.reduce(
    (sum, segment) => sum + (segment.estimatedConversionRate * segment.leads.length),
    0
  ) / totalLeads;

  const highPriorityLeads = segments
    .filter(s => s.priority === 'high')
    .reduce((sum, segment) => sum + segment.leads.length, 0);

  return {
    totalSegments: segments.length,
    totalLeads,
    highPriorityLeads,
    estimatedConversions: Math.round(totalLeads * weightedConversionRate),
    averageConversionRate: weightedConversionRate,
    topSegment: segments[0]?.name || 'None',
    recommendedFocus: segments
      .filter(s => s.priority === 'high')
      .map(s => s.name)
      .slice(0, 3),
  };
}
