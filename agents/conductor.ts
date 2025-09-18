import { StateGraph, START, END } from "@langchain/langgraph";
import { z } from "zod";
import { profilerNode } from "./profiler";
import { deckNode as deckGoogleNode } from "./deck.google";
import { deckGammaNode } from "./deck.gamma";
import { funnelNode } from "./funnel";
import { affiliateNode } from "./affiliate";
import { outreachNode } from "./outreach";
import { followupNode } from "./followup";
import { analyticsTap } from "./analytics";
import { flags } from "../lib/flags";

export const EventState = z.object({
  packet: z.any(),
  artifacts: z.any().default({}),
  approvals: z.array(z.string()).default([]),
  errors: z.array(z.string()).default([]),
});

type EventStateType = z.infer<typeof EventState>;

export function buildGraph() {
  const g = new StateGraph<EventStateType>({
    stateSchema: EventState,
    channels: {
      packet: null,
      artifacts: null,
      approvals: null,
      errors: null,
    }
  });

  g.addNode("analyticsTap", analyticsTap);
  g.addNode("profiler", profilerNode);
  g.addNode("deck_google", deckGoogleNode);
  g.addNode("deck_gamma", deckGammaNode);
  g.addNode("funnel", funnelNode);
  g.addNode("affiliate", affiliateNode);
  g.addNode("outreach", outreachNode);
  g.addNode("followup", followupNode);

  g.addEdge(START, "analyticsTap");
  g.addEdge(START, "profiler");

  g.addConditionalEdges("profiler", (state: EventStateType) => {
    let provider = state.packet?.assets?.deckProvider ?? flags.defaultDeckProvider ?? "google";

    if (!flags.gammaEnabled) {
      if (provider === "gamma" || provider === "both") {
        provider = "google";
      }
    }

    if (provider === "both") return ["deck_google", "deck_gamma"];
    if (provider === "gamma") return ["deck_gamma"];
    return ["deck_google"];
  });

  g.addConditionalEdges("deck_google", (state: EventStateType) => {
    const provider = state.packet?.assets?.deckProvider ?? flags.defaultDeckProvider ?? "google";
    const both = flags.gammaEnabled && provider === "both";
    if (both && !state.artifacts?.deck?.providers?.gamma) {
      return [];
    }
    return ["funnel"];
  });

  g.addConditionalEdges("deck_gamma", (state: EventStateType) => {
    const provider = state.packet?.assets?.deckProvider ?? flags.defaultDeckProvider ?? "google";
    const both = flags.gammaEnabled && provider === "both";
    if (both && !state.artifacts?.deck?.providers?.google) {
      return [];
    }
    return ["funnel"];
  });

  g.addEdge("funnel", "affiliate");
  g.addEdge("affiliate", "outreach");
  g.addEdge("outreach", END);

  return g.compile();
}
