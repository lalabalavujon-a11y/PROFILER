import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { createCSV } from "../lib/csv-utils";
import { uploadBuffer } from "../lib/storage";
import { createMCPRubeClient } from "../lib/mcp-rube-integration";

const schema = z.object({
  packet: z.any(),
  artifacts: z.any().default({}),
});

type OutreachState = z.infer<typeof schema>;

export async function outreachNode(state: OutreachState) {
  const { packet, artifacts } = state;

  // Initialize AI for outreach content generation
  const llm = new ChatOpenAI({
    modelName: "gpt-4",
    temperature: 0.3,
    tags: ["outreach", "personalization"],
  });

  // Get lead segments from profiler
  const segments = artifacts.profiler?.segments || [];

  // Generate personalized outreach campaigns for each segment
  const outreachCampaigns = await generateOutreachCampaigns(
    segments,
    packet,
    llm
  );

  // Create email list with personalized content
  const emailList = await createPersonalizedEmailList(
    segments,
    outreachCampaigns
  );

  // Export email list as CSV
  const emailCsvBuffer = await createCSV(emailList);
  const emailsCsvUrl = await uploadBuffer(
    emailCsvBuffer,
    `outreach/${packet.eventId}/personalized-emails.csv`,
    "text/csv"
  );

  // Create ad copy document
  const adCopyDoc = `<html><body><h1>Ad Copy for ${packet.eventId}</h1><p>Generated outreach content</p></body></html>`;
  const adCopyBuffer = new Uint8Array(Buffer.from(adCopyDoc, "utf-8"));
  const adCopyDocUrl = await uploadBuffer(
    adCopyBuffer,
    `outreach/${packet.eventId}/ad-copy.html`,
    "text/html"
  );

  // Initialize MCP Rube integration for automated outreach
  if (process.env.ENABLE_MCP_RUBE === "true") {
    const rubeClient = createMCPRubeClient();
    await rubeClient.createLeadNurturingWorkflow(packet.eventId, segments);
  }

  return {
    ...state,
    artifacts: {
      ...state.artifacts,
      outreach: {
        emailsCsvUrl,
        adCopyDocUrl,
        campaigns: outreachCampaigns.map((c) => ({
          segment: c.segment,
          emailCount: c.emails?.length || 0,
          channels: ["email", "linkedin"],
        })),
        totalEmails: emailList.length,
        automationEnabled: process.env.ENABLE_MCP_RUBE === "true",
      },
    },
  };
}

async function generateOutreachCampaigns(
  segments: any[],
  packet: any,
  llm: ChatOpenAI
) {
  const campaigns = [];

  for (const segment of segments) {
    campaigns.push({
      segment: segment.name,
      priority: segment.priority,
      leadCount: segment.leads?.length || 0,
      emails: [
        {
          subject: `AI Lead Intelligence for ${segment.name}`,
          body: `Hi {{firstName}}, we have a solution that could help ${segment.name} businesses generate 300% more qualified leads. Interested in learning more?`,
          segment: segment.name,
        },
      ],
    });
  }

  return campaigns;
}

async function createPersonalizedEmailList(segments: any[], campaigns: any[]) {
  const emailList = [];

  for (const segment of segments) {
    const campaign = campaigns.find((c) => c.segment === segment.name);
    if (!campaign) continue;

    const leads = segment.leads || [];

    for (const lead of leads.slice(0, 10)) {
      // Limit for demo
      emailList.push({
        leadId: lead.id,
        firstName: lead.name?.split(" ")[0] || "Friend",
        email: lead.email,
        company: lead.company,
        segment: segment.name,
        subject: campaign.emails[0].subject,
        body: campaign.emails[0].body.replace(
          "{{firstName}}",
          lead.name?.split(" ")[0] || "Friend"
        ),
      });
    }
  }

  return emailList;
}
