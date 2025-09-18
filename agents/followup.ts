import { z } from "zod";
import { logWorkflowExecution } from "../lib/langsmith-config";
import { createMCPRubeClient } from "../lib/mcp-rube-integration";

const schema = z.object({
  packet: z.any(),
  artifacts: z.any().default({}),
});

type FollowupState = z.infer<typeof schema>;

export async function followupNode(state: FollowupState) {
  const { packet, artifacts } = state;
  const startTime = Date.now();
  
  // Log workflow completion to LangSmith
  const workflowDuration = Date.now() - (artifacts.analytics?.workflowStartTime || Date.now());
  
  await logWorkflowExecution(
    packet.eventId,
    'lead_recon_workflow_complete',
    { packet },
    { 
      artifacts: {
        profilerSegments: artifacts.profiler?.segments?.length || 0,
        deckGenerated: !!artifacts.deck,
        funnelCreated: !!artifacts.funnel,
        outreachReady: !!artifacts.outreach,
      }
    },
    workflowDuration,
    { 
      success: true,
      totalLeads: artifacts.profiler?.totalLeads || 0,
      highValueLeads: artifacts.profiler?.highValueLeads || 0,
    }
  );
  
  // Set up post-workflow automation
  if (process.env.ENABLE_MCP_RUBE === 'true') {
    const rubeClient = createMCPRubeClient();
    
    // Trigger lead nurturing for high-priority segments
    const highPrioritySegments = artifacts.profiler?.segments?.filter((s: any) => s.priority === 'high') || [];
    for (const segment of highPrioritySegments) {
      await rubeClient.triggerWorkflow(`lead_nurturing_${packet.eventId}`, {
        segment: segment.name,
        leads: segment.leads?.slice(0, 50), // Limit batch size
        eventId: packet.eventId,
      });
    }
  }
  
  // Generate summary report
  const summary = {
    eventId: packet.eventId,
    completedAt: new Date().toISOString(),
    processingTime: workflowDuration,
    results: {
      totalLeads: artifacts.profiler?.totalLeads || 0,
      segments: artifacts.profiler?.segments?.length || 0,
      highValueLeads: artifacts.profiler?.highValueLeads || 0,
      averageLeadScore: artifacts.profiler?.averageScore || 0,
      deckGenerated: !!artifacts.deck,
      funnelCreated: !!artifacts.funnel,
      affiliateLinksReady: !!artifacts.tracking,
      outreachCampaignsReady: !!artifacts.outreach,
    },
    nextSteps: [
      'Review lead segments and personalized messaging',
      'Launch outreach campaigns using generated content',
      'Monitor funnel performance and conversion rates',
      'Optimize based on analytics and feedback',
    ],
  };
  
  console.log(`✅ Lead Recon workflow completed for event: ${packet.eventId}`);
  console.log(`📈 Generated ${summary.results.segments} segments from ${summary.results.totalLeads} leads`);
  
  return {
    ...state,
    artifacts: {
      ...state.artifacts,
      summary,
    },
  };
}
