import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

const LeadSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  company: z.string(),
  industry: z.string(),
  size: z.string(),
  revenue: z.number(),
  employees: z.number(),
  location: z.string(),
  engagementScore: z.number(),
  lastActivity: z.date(),
  source: z.string(),
});

type Lead = z.infer<typeof LeadSchema>;

export interface ScoredLead extends Lead {
  score: number;
  segment: string;
  priority: "high" | "medium" | "low";
  recommendedAction: string;
  reasoning: string;
}

export class LeadScorer {
  constructor(private llm: ChatOpenAI) {}

  async scoreLeads(leads: Lead[]): Promise<ScoredLead[]> {
    const batchSize = parseInt(process.env.MAX_LEADS_PER_BATCH || "20");
    const scoredLeads: ScoredLead[] = [];

    // Process leads in batches to avoid token limits
    for (let i = 0; i < leads.length; i += batchSize) {
      const batch = leads.slice(i, i + batchSize);
      const batchResults = await this.scoreBatch(batch);
      scoredLeads.push(...batchResults);
    }

    return scoredLeads;
  }

  private async scoreBatch(leads: Lead[]): Promise<ScoredLead[]> {
    const prompt = PromptTemplate.fromTemplate(`
      You are an AI lead scoring expert for B2B SaaS and digital marketing services.

      Score each lead from 0.0 to 1.0 based on:
      - Company size and revenue (higher = better)
      - Industry fit (SaaS, E-commerce, Agencies = higher scores)
      - Engagement level and recency
      - Geographic location (US, UK, CA, AU = higher)
      - Lead source quality

      For each lead, provide:
      1. Score (0.0-1.0)
      2. Segment (Enterprise, SMB, Startup, etc.)
      3. Priority (high/medium/low)
      4. Recommended action
      5. Brief reasoning

      Leads to score:
      {leadsData}

      Return JSON array with format:
      [{{
        "id": "lead_id",
        "score": 0.85,
        "segment": "SMB",
        "priority": "high",
        "recommendedAction": "Schedule demo call",
        "reasoning": "High revenue SMB in target industry with recent activity"
      }}]
    `);

    const leadsData = leads.map((lead) => ({
      id: lead.id,
      company: lead.company,
      industry: lead.industry,
      size: lead.size,
      revenue: lead.revenue,
      employees: lead.employees,
      location: lead.location,
      engagementScore: lead.engagementScore,
      daysSinceActivity: Math.floor(
        (Date.now() - lead.lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      ),
      source: lead.source,
    }));

    try {
      const response = await this.llm.invoke(
        await prompt.format({
          leadsData: JSON.stringify(leadsData, null, 2),
        })
      );

      const scoringResults = JSON.parse(response.content as string);

      return leads.map((lead, index) => {
        const result = scoringResults.find((r: any) => r.id === lead.id) || {
          score: 0.5,
          segment: "Unknown",
          priority: "medium",
          recommendedAction: "Review manually",
          reasoning: "Failed to analyze",
        };

        return {
          ...lead,
          ...result,
        };
      });
    } catch (error) {
      console.error("Error scoring leads:", error);
      // Fallback scoring
      return leads.map((lead) => ({
        ...lead,
        score: this.calculateFallbackScore(lead),
        segment: this.determineSegment(lead),
        priority: "medium" as const,
        recommendedAction: "Review and qualify",
        reasoning: "Fallback scoring due to API error",
      }));
    }
  }

  private calculateFallbackScore(lead: Lead): number {
    let score = 0.5; // Base score

    // Revenue scoring
    if (lead.revenue > 5000000) score += 0.3;
    else if (lead.revenue > 1000000) score += 0.2;
    else if (lead.revenue > 500000) score += 0.1;

    // Industry scoring
    const highValueIndustries = ["SaaS", "E-commerce", "Agency", "Consulting"];
    if (highValueIndustries.includes(lead.industry)) score += 0.15;

    // Size scoring
    if (lead.size === "enterprise") score += 0.2;
    else if (lead.size === "smb") score += 0.1;

    // Engagement scoring
    score += lead.engagementScore * 0.2;

    // Recency scoring
    const daysSinceActivity = Math.floor(
      (Date.now() - lead.lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceActivity < 7) score += 0.1;
    else if (daysSinceActivity < 30) score += 0.05;

    return Math.min(1.0, Math.max(0.0, score));
  }

  private determineSegment(lead: Lead): string {
    if (lead.revenue > 10000000 || lead.employees > 500) return "Enterprise";
    if (lead.revenue > 1000000 || lead.employees > 50) return "SMB";
    return "Startup";
  }
}

export function createLeadScorer(llm: ChatOpenAI): LeadScorer {
  return new LeadScorer(llm);
}
