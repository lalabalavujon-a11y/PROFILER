import { Client } from "langsmith";

let langsmithClient: Client | null = null;

export function initializeLangSmith() {
  if (process.env.LANGCHAIN_API_KEY) {
    langsmithClient = new Client({
      apiUrl:
        process.env.LANGCHAIN_ENDPOINT || "https://api.smith.langchain.com",
      apiKey: process.env.LANGCHAIN_API_KEY,
    });

    console.log("🔍 LangSmith tracing initialized");
  } else {
    console.warn("⚠️  LangSmith API key not found, tracing disabled");
  }
}

export function getLangSmithClient(): Client | null {
  return langsmithClient;
}

export async function logWorkflowExecution(
  eventId: string,
  workflowName: string,
  inputs: any,
  outputs: any,
  duration: number,
  metadata: Record<string, any> = {}
) {
  if (!langsmithClient) return;

  try {
    await langsmithClient.createRun({
      name: workflowName,
      inputs,
      outputs,
      run_type: "chain",
      start_time: Date.now() - duration,
      end_time: Date.now(),
      extra: {
        eventId,
        duration,
        ...metadata,
      },
      tags: ["lead-recon", "workflow", workflowName.toLowerCase()],
    });
  } catch (error) {
    console.error("Failed to log to LangSmith:", error);
  }
}

export async function logAgentExecution(
  agentName: string,
  eventId: string,
  inputs: any,
  outputs: any,
  duration: number,
  success: boolean = true,
  error?: string
) {
  if (!langsmithClient) return;

  try {
    await langsmithClient.createRun({
      name: `agent_${agentName}`,
      inputs,
      outputs: success ? outputs : { error },
      run_type: "llm",
      start_time: Date.now() - duration,
      end_time: Date.now(),
      extra: {
        eventId,
        agentName,
        duration,
        success,
      },
      tags: ["lead-recon", "agent", agentName],
    });
  } catch (error) {
    console.error("Failed to log agent execution to LangSmith:", error);
  }
}

export async function createDataset(name: string, description: string) {
  if (!langsmithClient) return null;

  try {
    const dataset = await langsmithClient.createDataset(name, {
      description,
      data_type: "kv",
    });

    console.log(`📊 Created LangSmith dataset: ${name}`);
    return dataset;
  } catch (error) {
    console.error("Failed to create dataset:", error);
    return null;
  }
}

export async function addExampleToDataset(
  datasetName: string,
  inputs: any,
  outputs: any,
  metadata: Record<string, any> = {}
) {
  if (!langsmithClient) return;

  try {
    await langsmithClient.createExample(inputs, outputs, {
      dataset_name: datasetName,
      metadata,
    });
  } catch (error) {
    console.error("Failed to add example to dataset:", error);
  }
}

export interface PerformanceMetrics {
  totalRuns: number;
  averageDuration: number;
  successRate: number;
  errorRate: number;
  topErrors: Array<{ error: string; count: number }>;
}

export async function getPerformanceMetrics(
  projectName: string,
  timeRange: { start: Date; end: Date }
): Promise<PerformanceMetrics | null> {
  if (!langsmithClient) return null;

  try {
    // In real implementation, this would query LangSmith API
    // for actual performance metrics

    const mockMetrics: PerformanceMetrics = {
      totalRuns: 150,
      averageDuration: 12500, // ms
      successRate: 0.94,
      errorRate: 0.06,
      topErrors: [
        { error: "OpenAI rate limit exceeded", count: 5 },
        { error: "Supabase connection timeout", count: 3 },
        { error: "Invalid packet format", count: 1 },
      ],
    };

    return mockMetrics;
  } catch (error) {
    console.error("Failed to fetch performance metrics:", error);
    return null;
  }
}

export async function createFeedback(
  runId: string,
  score: number,
  feedback: string,
  metadata: Record<string, any> = {}
) {
  if (!langsmithClient) return;

  try {
    await langsmithClient.createFeedback(runId, "user_score", {
      score,
      comment: feedback,
      metadata,
    });
  } catch (error) {
    console.error("Failed to create feedback:", error);
  }
}
