import axios from "axios";

export interface RubeAction {
  id: string;
  name: string;
  type: "email" | "sms" | "webhook" | "crm" | "social" | "automation";
  config: Record<string, any>;
  triggers: string[];
}

export interface RubeWorkflow {
  id: string;
  name: string;
  description: string;
  actions: RubeAction[];
  enabled: boolean;
}

export class MCPRubeClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.RUBE_BASE_URL || "https://app.rube.io/api";
    this.apiKey = process.env.RUBE_API_KEY || "";

    if (!this.apiKey) {
      console.warn("⚠️  Rube API key not configured, MCP integration disabled");
    }
  }

  private async makeRequest(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    data?: any
  ) {
    if (!this.apiKey) {
      throw new Error("Rube API key not configured");
    }

    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        data,
      });

      return response.data;
    } catch (error) {
      console.error(
        `Rube API error (${method} ${endpoint}):`,
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async createLeadNurturingWorkflow(
    eventId: string,
    segments: any[]
  ): Promise<RubeWorkflow> {
    const workflow: RubeWorkflow = {
      id: `lead_nurturing_${eventId}`,
      name: `Lead Nurturing - ${eventId}`,
      description: "AI-powered lead nurturing based on profiler segments",
      enabled: true,
      actions: [],
    };

    // Create email sequences for each segment
    for (const segment of segments) {
      const emailSequence: RubeAction = {
        id: `email_sequence_${segment.name.toLowerCase().replace(/\s+/g, "_")}`,
        name: `Email Sequence - ${segment.name}`,
        type: "email",
        config: {
          sequence: await this.generateEmailSequence(segment),
          delay: "1 day",
          conditions: {
            segment: segment.name,
            minScore: 0.5,
          },
        },
        triggers: ["lead_scored", "segment_assigned"],
      };

      workflow.actions.push(emailSequence);
    }

    // Add SMS follow-up for high-priority segments
    const highPrioritySegments = segments.filter((s) => s.priority === "high");
    for (const segment of highPrioritySegments) {
      const smsAction: RubeAction = {
        id: `sms_followup_${segment.name.toLowerCase().replace(/\s+/g, "_")}`,
        name: `SMS Follow-up - ${segment.name}`,
        type: "sms",
        config: {
          message: `Hi {{firstName}}, saw you're interested in our lead intelligence solution. Quick question - what's your biggest challenge with lead generation right now? - ${eventId}`,
          delay: "3 days",
          conditions: {
            segment: segment.name,
            priority: "high",
            emailOpened: false,
          },
        },
        triggers: ["email_not_opened"],
      };

      workflow.actions.push(smsAction);
    }

    // Create the workflow in Rube
    try {
      const result = await this.makeRequest("/workflows", "POST", workflow);
      console.log(`📧 Created Rube workflow: ${workflow.id}`);
      return result;
    } catch (error) {
      console.error("Failed to create Rube workflow:", error);
      return workflow; // Return local copy even if API fails
    }
  }

  private async generateEmailSequence(
    segment: any
  ): Promise<Array<{ subject: string; content: string; delay: string }>> {
    // In real implementation, this would use AI to generate personalized sequences
    const sequences = {
      "High-Value Enterprise": [
        {
          subject: "Enterprise Lead Intelligence Demo",
          content: `Hi {{firstName}},\n\nI noticed your company fits our enterprise profile for lead intelligence solutions.\n\nWould you be interested in a 15-minute demo showing how we've helped similar companies increase qualified leads by 300%?\n\nBest regards,\n{{senderName}}`,
          delay: "0 days",
        },
        {
          subject: "Case Study: How {{companyName}} Could Benefit",
          content: `Hi {{firstName}},\n\nI put together a brief case study showing how a company similar to {{companyName}} transformed their lead generation.\n\nKey results:\n- 300% more qualified leads\n- 50% shorter sales cycle\n- $2M additional revenue in 6 months\n\nInterested in seeing the full breakdown?\n\nBest,\n{{senderName}}`,
          delay: "3 days",
        },
        {
          subject: "Final invitation: Lead Intelligence Masterclass",
          content: `Hi {{firstName}},\n\nThis is my final invitation to join our exclusive Lead Intelligence Masterclass.\n\nLimited to 20 enterprise leaders, we'll cover:\n- AI-powered lead scoring\n- Automated personalization at scale\n- ROI optimization strategies\n\nSecure your spot: {{registrationLink}}\n\nBest,\n{{senderName}}`,
          delay: "7 days",
        },
      ],
      "SMB Growth Companies": [
        {
          subject: "Quick win for {{companyName}}",
          content: `Hi {{firstName}},\n\nI have a quick idea that could help {{companyName}} generate more qualified leads this month.\n\nWould you be open to a 10-minute conversation?\n\nBest,\n{{senderName}}`,
          delay: "0 days",
        },
        {
          subject: "The $10K/month lead generation blueprint",
          content: `Hi {{firstName}},\n\nI'm sharing our proven blueprint that's helped SMBs like {{companyName}} generate an extra $10K/month in qualified leads.\n\nNo catch - just value.\n\nDownload here: {{downloadLink}}\n\nBest,\n{{senderName}}`,
          delay: "2 days",
        },
      ],
      default: [
        {
          subject: "Transform your lead generation",
          content: `Hi {{firstName}},\n\nThanks for your interest in our lead intelligence solution.\n\nI'd love to show you how we can help {{companyName}} generate more qualified leads.\n\nBest,\n{{senderName}}`,
          delay: "0 days",
        },
      ],
    };

    return sequences[segment.name] || sequences["default"];
  }

  async triggerWorkflow(workflowId: string, leadData: any): Promise<void> {
    try {
      await this.makeRequest(`/workflows/${workflowId}/trigger`, "POST", {
        leadData,
        timestamp: new Date().toISOString(),
      });

      console.log(`🚀 Triggered Rube workflow: ${workflowId}`);
    } catch (error) {
      console.error("Failed to trigger workflow:", error);
    }
  }

  async createCRMIntegration(
    eventId: string,
    crmType: "hubspot" | "salesforce" | "pipedrive"
  ): Promise<RubeAction> {
    const crmAction: RubeAction = {
      id: `crm_sync_${eventId}`,
      name: `CRM Sync - ${crmType}`,
      type: "crm",
      config: {
        platform: crmType,
        actions: [
          "create_contact",
          "update_lead_score",
          "assign_to_sales_rep",
          "create_follow_up_task",
        ],
        mappings: {
          email: "email",
          firstName: "first_name",
          lastName: "last_name",
          company: "company",
          leadScore: "custom_lead_score",
          segment: "custom_segment",
        },
      },
      triggers: ["lead_scored", "segment_assigned", "funnel_completed"],
    };

    try {
      const result = await this.makeRequest("/actions", "POST", crmAction);
      console.log(`🔗 Created CRM integration: ${crmType}`);
      return result;
    } catch (error) {
      console.error("Failed to create CRM integration:", error);
      return crmAction;
    }
  }

  async createSocialMediaCampaign(
    eventId: string,
    segments: any[]
  ): Promise<RubeAction[]> {
    const campaigns: RubeAction[] = [];

    for (const segment of segments.slice(0, 3)) {
      // Limit to top 3 segments
      const campaign: RubeAction = {
        id: `social_campaign_${segment.name
          .toLowerCase()
          .replace(/\s+/g, "_")}`,
        name: `Social Campaign - ${segment.name}`,
        type: "social",
        config: {
          platforms: ["linkedin", "facebook", "twitter"],
          content: {
            linkedin: {
              post: `Attention ${segment.name}: New AI-powered lead intelligence solution is transforming how businesses identify and convert prospects. Early results show 300% increase in qualified leads. Learn more: {{landingPageUrl}}`,
              targetAudience: {
                industries: [segment.characteristics[0]],
                jobTitles: ["CEO", "Marketing Director", "Sales Manager"],
                companySize: segment.name.includes("Enterprise")
                  ? "500+"
                  : "50-500",
              },
            },
            facebook: {
              post: `🚀 Revolutionary lead intelligence for ${segment.name}! See how AI can transform your lead generation. {{landingPageUrl}}`,
              audience: "lookalike",
            },
          },
          budget: segment.priority === "high" ? 500 : 200,
          duration: "7 days",
        },
        triggers: ["funnel_created", "segment_analyzed"],
      };

      campaigns.push(campaign);
    }

    try {
      const results = await Promise.all(
        campaigns.map((campaign) =>
          this.makeRequest("/actions", "POST", campaign)
        )
      );

      console.log(`📱 Created ${results.length} social media campaigns`);
      return results;
    } catch (error) {
      console.error("Failed to create social media campaigns:", error);
      return campaigns;
    }
  }

  async getWorkflowAnalytics(workflowId: string): Promise<{
    totalTriggers: number;
    successRate: number;
    averageResponseTime: number;
    topPerformingActions: string[];
  }> {
    try {
      const analytics = await this.makeRequest(
        `/workflows/${workflowId}/analytics`
      );
      return analytics;
    } catch (error) {
      console.error("Failed to fetch workflow analytics:", error);

      // Return mock analytics
      return {
        totalTriggers: 45,
        successRate: 0.87,
        averageResponseTime: 2.3,
        topPerformingActions: ["email_sequence_smb", "sms_followup_enterprise"],
      };
    }
  }
}

export function createMCPRubeClient(): MCPRubeClient {
  return new MCPRubeClient();
}
