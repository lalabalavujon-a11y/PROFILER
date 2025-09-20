// import { Client } from "langsmith";
type Client = any;

let langsmithClient: Client | null = null;

export function initializeLangSmith() {
  if (process.env.LANGCHAIN_API_KEY) {
    try {
      // Try to dynamically import and create client
      // For now, we'll skip actual client creation to avoid build issues
      console.log("🔍 LangSmith tracing initialized (mock mode)");
      langsmithClient = {} as Client; // Mock client for build compatibility
    } catch (error) {
      console.warn("⚠️  LangSmith client creation failed, using mock mode");
      langsmithClient = {} as Client;
    }
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
    // Mock mode - just log instead of actual API call
    console.log(`📊 [LangSmith] Workflow: ${workflowName}, Duration: ${duration}ms`);
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
    // Mock mode - just log instead of actual API call
    console.log(`🤖 [LangSmith] Agent: ${agentName}, Success: ${success}, Duration: ${duration}ms`);
  } catch (error) {
    console.error("Failed to log agent execution to LangSmith:", error);
  }
}

export async function createDataset(name: string, description: string) {
  if (!langsmithClient) return null;

  try {
    // Mock mode - just log instead of actual API call
    console.log(`📊 [LangSmith] Mock dataset created: ${name}`);
    return { id: `mock_${name}`, name, description };
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
    // Mock mode - just log instead of actual API call
    console.log(`📊 [LangSmith] Mock example added to dataset: ${datasetName}`);
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
    // Mock mode - just log instead of actual API call
    console.log(`📊 [LangSmith] Mock feedback created for run: ${runId}, Score: ${score}`);
  } catch (error) {
    console.error("Failed to create feedback:", error);
  }
}
