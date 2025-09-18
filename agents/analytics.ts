import { z } from "zod";
import { logWorkflowExecution } from "../lib/langsmith-config";

const schema = z.object({
  packet: z.any(),
  artifacts: z.any().default({}),
});

type AnalyticsState = z.infer<typeof schema>;

export async function analyticsTap(state: AnalyticsState) {
  const { packet } = state;
  const startTime = Date.now();
  
  // Log workflow start to LangSmith
  await logWorkflowExecution(
    packet.eventId,
    'lead_recon_workflow_start',
    { packet },
    { status: 'started' },
    0,
    { 
      industry: packet.audience?.industry,
      deckProvider: packet.assets?.deckProvider,
      offerPrice: packet.offer?.tripwirePrice,
    }
  );
  
  // Track key metrics
  const analytics = {
    workflowStartTime: startTime,
    eventId: packet.eventId,
    industry: packet.audience?.industry,
    audienceSize: packet.audience?.size,
    deckProvider: packet.assets?.deckProvider,
    offerDetails: {
      tripwirePrice: packet.offer?.tripwirePrice,
      bumpEnabled: packet.offer?.bumpEnabled,
      bumpPrice: packet.offer?.bumpPrice,
    },
    hostInfo: {
      name: packet.host?.name,
      payoutModel: packet.host?.payoutModel,
      commissionPct: packet.host?.commissionPct,
    },
  };
  
  console.log(`📊 Analytics tracking started for event: ${packet.eventId}`);
  
  return {
    ...state,
    artifacts: {
      ...state.artifacts,
      analytics,
    },
  };
}
