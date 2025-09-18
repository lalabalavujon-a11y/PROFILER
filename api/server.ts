import express from "express";
import cors from "cors";
import { buildGraph } from "../agents/conductor";
import { handleStripeWebhook } from "../lib/stripe-integration";
import { initializeLangSmith } from "../lib/langsmith-config";

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.raw({ type: "application/webhook+json" }));

// Initialize LangSmith tracing
initializeLangSmith();

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Main workflow endpoint
app.post("/api/run-event", async (req, res) => {
  try {
    const { packet } = req.body;

    if (!packet || !packet.eventId) {
      return res.status(400).json({
        error: "Invalid packet: eventId is required",
      });
    }

    console.log(`Processing event: ${packet.eventId}`);

    // Build and execute the workflow graph
    const graph = buildGraph();
    const initialState = {
      packet,
      artifacts: {},
      approvals: [],
      errors: [],
    };

    const result = await graph.invoke(initialState);

    res.json({
      success: true,
      eventId: packet.eventId,
      artifacts: result.artifacts,
      executionTime: Date.now(),
    });
  } catch (error) {
    console.error("Workflow execution error:", error);
    res.status(500).json({
      error: "Workflow execution failed",
      message: error.message,
      eventId: req.body?.packet?.eventId,
    });
  }
});

// Stripe webhook endpoint
app.post("/api/webhooks/stripe", (req, res) => {
  try {
    const sig = req.headers["stripe-signature"] as string;

    // In real implementation, verify webhook signature:
    // const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    const event = JSON.parse(req.body.toString());
    handleStripeWebhook(event);

    res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    res.status(400).json({ error: "Webhook processing failed" });
  }
});

// Lead upload endpoint
app.post("/api/leads/upload", async (req, res) => {
  try {
    const { leads, eventId } = req.body;

    if (!leads || !Array.isArray(leads)) {
      return res.status(400).json({ error: "Invalid leads data" });
    }

    // Process uploaded leads
    console.log(`Processing ${leads.length} leads for event: ${eventId}`);

    // In real implementation, this would:
    // 1. Validate lead data format
    // 2. Store in database
    // 3. Trigger lead scoring workflow
    // 4. Return processing status

    res.json({
      success: true,
      message: `Successfully uploaded ${leads.length} leads`,
      eventId,
      leadIds: leads.map((_, i) => `lead_${eventId}_${i + 1}`),
    });
  } catch (error) {
    console.error("Lead upload error:", error);
    res.status(500).json({ error: "Lead upload failed" });
  }
});

// Analytics endpoint
app.get("/api/analytics/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;

    // In real implementation, fetch from database/analytics service
    const mockAnalytics = {
      eventId,
      totalLeads: 150,
      qualifiedLeads: 45,
      conversionRate: 0.12,
      revenue: 8940,
      topSegments: [
        { name: "SMB Growth Companies", leads: 25, revenue: 4500 },
        { name: "Tech-Savvy Startups", leads: 15, revenue: 2700 },
        { name: "High-Value Enterprise", leads: 5, revenue: 1740 },
      ],
      performance: {
        emailOpenRate: 0.34,
        clickThroughRate: 0.08,
        funnelConversionRate: 0.15,
      },
    };

    res.json(mockAnalytics);
  } catch (error) {
    console.error("Analytics fetch error:", error);
    res.status(500).json({ error: "Analytics fetch failed" });
  }
});

// MCP Rube.io integration endpoint
app.post("/api/mcp/trigger", async (req, res) => {
  try {
    const { action, payload } = req.body;

    console.log(`MCP trigger received: ${action}`);

    // In real implementation, this would integrate with app.Rube.io
    // to trigger various automation workflows

    switch (action) {
      case "lead_scored":
        // Trigger lead nurturing sequences
        break;
      case "funnel_completed":
        // Trigger fulfillment and onboarding
        break;
      case "segment_identified":
        // Trigger personalized campaigns
        break;
      default:
        console.log(`Unknown MCP action: ${action}`);
    }

    res.json({
      success: true,
      action,
      processed: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("MCP trigger error:", error);
    res.status(500).json({ error: "MCP trigger failed" });
  }
});

// Batch processing endpoint
app.post("/api/batch/process", async (req, res) => {
  try {
    const { packets } = req.body;

    if (!packets || !Array.isArray(packets)) {
      return res.status(400).json({ error: "Invalid packets array" });
    }

    console.log(`Processing batch of ${packets.length} events`);

    const graph = buildGraph();
    const results = [];

    // Process packets in parallel (limited concurrency)
    const batchSize = 5;
    for (let i = 0; i < packets.length; i += batchSize) {
      const batch = packets.slice(i, i + batchSize);
      const batchPromises = batch.map(async (packet) => {
        try {
          const initialState = {
            packet,
            artifacts: {},
            approvals: [],
            errors: [],
          };

          const result = await graph.invoke(initialState);
          return {
            eventId: packet.eventId,
            success: true,
            artifacts: result.artifacts,
          };
        } catch (error) {
          return {
            eventId: packet.eventId,
            success: false,
            error: error.message,
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    res.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error("Batch processing error:", error);
    res.status(500).json({ error: "Batch processing failed" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Lead Recon API server running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🔗 Main endpoint: http://localhost:${port}/api/run-event`);
});

export default app;
