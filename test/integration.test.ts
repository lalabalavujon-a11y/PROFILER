import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildGraph } from "../agents/conductor";
import * as storage from "../lib/storage";
import * as gamma from "../lib/gamma";

// Mock external dependencies
vi.mock("../lib/storage");
vi.mock("../lib/gamma");
vi.mock("@langchain/openai");
vi.mock("../lib/google-slides");
vi.mock("../lib/mcp-rube-integration");

describe("Lead Recon Integration Test", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    // Mock storage upload
    vi.spyOn(storage, "uploadBuffer").mockResolvedValue(
      "https://cdn.example.com/test-file.csv"
    );

    // Mock Gamma client
    vi.spyOn(gamma.gammaClient, "generate").mockResolvedValue({
      docId: "doc_test123",
      shareUrl: "https://gamma.app/docs/doc_test123",
    });
    vi.spyOn(gamma.gammaClient, "export").mockResolvedValue(
      new Uint8Array([1, 2, 3])
    );
  });

  it("executes complete Lead Recon workflow", async () => {
    const testPacket = {
      eventId: "test_event_123",
      date: "2025-09-18",
      host: {
        name: "Test Host",
        logoUrl: "https://example.com/logo.png",
        email: "host@example.com",
        website: "https://example.com",
        payoutModel: "GHL_AFFILIATE",
        commissionPct: 30,
      },
      audience: {
        industry: "SaaS",
        size: "smb",
      },
      offer: {
        tripwirePrice: 297,
        tripwireCredits: 1000,
        bumpEnabled: true,
        bumpPrice: 99,
      },
      assets: {
        deckProvider: "both",
        brandingPalette: ["#1f2937", "#3b82f6", "#10b981"],
      },
      leadSources: {
        crm: { type: "hubspot", apiKey: "test" },
        social: { platforms: ["linkedin", "facebook"] },
        website: { analytics: "google" },
      },
    };

    const graph = buildGraph();
    const initialState = {
      packet: testPacket,
      artifacts: {},
      approvals: [],
      errors: [],
    };

    const result = await graph.invoke(initialState);

    // Verify workflow completion
    expect(result.packet.eventId).toBe("test_event_123");

    // Verify profiler artifacts
    expect(result.artifacts.profiler).toBeDefined();
    expect(result.artifacts.profiler.segments).toBeDefined();
    expect(result.artifacts.profiler.totalLeads).toBeGreaterThan(0);
    expect(result.artifacts.profiler.csvUrl).toBeDefined();

    // Verify deck artifacts (both providers)
    expect(result.artifacts.deck).toBeDefined();
    expect(result.artifacts.deck.providers.gamma).toBeDefined();
    expect(result.artifacts.deck.providers.google).toBeDefined();
    expect(result.artifacts.deck.active).toBeDefined();

    // Verify funnel artifacts
    expect(result.artifacts.funnel).toBeDefined();
    expect(result.artifacts.funnel.url).toBeDefined();
    expect(result.artifacts.funnel.checkoutUrl).toBeDefined();

    // Verify affiliate tracking
    expect(result.artifacts.tracking).toBeDefined();
    expect(result.artifacts.tracking.affiliateLink).toBeDefined();
    expect(result.artifacts.tracking.utm).toBeDefined();

    // Verify outreach artifacts
    expect(result.artifacts.outreach).toBeDefined();
    expect(result.artifacts.outreach.emailsCsvUrl).toBeDefined();
    expect(result.artifacts.outreach.totalEmails).toBeGreaterThan(0);

    // Verify summary
    expect(result.artifacts.summary).toBeDefined();
    expect(result.artifacts.summary.eventId).toBe("test_event_123");
    expect(result.artifacts.summary.results.totalLeads).toBeGreaterThan(0);
  }, 30000); // 30 second timeout for integration test

  it("handles single deck provider (gamma only)", async () => {
    const testPacket = {
      eventId: "test_gamma_only",
      date: "2025-09-18",
      host: { name: "Gamma Test Host" },
      audience: { industry: "E-commerce", size: "startup" },
      offer: { tripwirePrice: 197, tripwireCredits: 500 },
      assets: { deckProvider: "gamma" },
    };

    const graph = buildGraph();
    const result = await graph.invoke({
      packet: testPacket,
      artifacts: {},
      approvals: [],
      errors: [],
    });

    expect(result.artifacts.deck.active).toBe("gamma");
    expect(result.artifacts.deck.providers.gamma).toBeDefined();
    expect(result.artifacts.deck.providers.google).toBeUndefined();
  });

  it("handles lead segmentation correctly", async () => {
    const testPacket = {
      eventId: "test_segmentation",
      date: "2025-09-18",
      host: { name: "Segmentation Test" },
      audience: { industry: "Consulting", size: "smb" },
      offer: { tripwirePrice: 497, tripwireCredits: 2000 },
      assets: { deckProvider: "google" },
    };

    const graph = buildGraph();
    const result = await graph.invoke({
      packet: testPacket,
      artifacts: {},
      approvals: [],
      errors: [],
    });

    const segments = result.artifacts.profiler.segments;
    expect(segments).toBeDefined();
    expect(Array.isArray(segments)).toBe(true);
    expect(segments.length).toBeGreaterThan(0);

    // Verify segment structure
    const firstSegment = segments[0];
    expect(firstSegment.name).toBeDefined();
    expect(firstSegment.size).toBeGreaterThan(0);
    expect(firstSegment.characteristics).toBeDefined();
    expect(firstSegment.priority).toMatch(/^(high|medium|low)$/);
  });

  it("calculates affiliate commissions correctly", async () => {
    const testPacket = {
      eventId: "test_commissions",
      date: "2025-09-18",
      host: {
        name: "Commission Test",
        commissionPct: 40, // 40% commission
      },
      audience: { industry: "Real Estate" },
      offer: {
        tripwirePrice: 500,
        tripwireCredits: 1500,
        bumpEnabled: true,
        bumpPrice: 150,
      },
      assets: { deckProvider: "gamma" },
    };

    const graph = buildGraph();
    const result = await graph.invoke({
      packet: testPacket,
      artifacts: {},
      approvals: [],
      errors: [],
    });

    const commissions = result.artifacts.tracking.commissionStructure;
    expect(commissions.commissionRate).toBe(0.4);
    expect(commissions.tripwireCommission).toBe(200); // 40% of $500
    expect(commissions.bumpCommission).toBe(60); // 40% of $150
    expect(commissions.totalPossibleCommission).toBe(260);
  });

  it("generates appropriate funnel strategy", async () => {
    const testPacket = {
      eventId: "test_funnel_strategy",
      date: "2025-09-18",
      host: { name: "Funnel Test Host" },
      audience: { industry: "Agency", size: "enterprise" },
      offer: {
        tripwirePrice: 997,
        tripwireCredits: 5000,
        bumpEnabled: false,
      },
      assets: { deckProvider: "both" },
    };

    const graph = buildGraph();
    const result = await graph.invoke({
      packet: testPacket,
      artifacts: {},
      approvals: [],
      errors: [],
    });

    const funnel = result.artifacts.funnel;
    expect(funnel.strategy).toBeDefined();
    expect(funnel.conversionElements).toBeDefined();
    expect(funnel.url).toContain("leadrecon.app");
    expect(funnel.checkoutUrl).toContain("checkout");
  });
});

describe("Error Handling", () => {
  it("handles missing required fields gracefully", async () => {
    const incompletePacket = {
      eventId: "test_incomplete",
      // Missing required fields
    };

    const graph = buildGraph();

    // Should not throw, but handle gracefully
    const result = await graph.invoke({
      packet: incompletePacket,
      artifacts: {},
      approvals: [],
      errors: [],
    });

    expect(result.packet.eventId).toBe("test_incomplete");
    // Should still complete workflow with defaults
    expect(result.artifacts.profiler).toBeDefined();
  });

  it("continues workflow even if external API fails", async () => {
    // Mock API failure
    vi.spyOn(storage, "uploadBuffer").mockRejectedValueOnce(
      new Error("Upload failed")
    );

    const testPacket = {
      eventId: "test_api_failure",
      host: { name: "API Failure Test" },
      audience: { industry: "SaaS" },
      offer: { tripwirePrice: 297 },
      assets: { deckProvider: "gamma" },
    };

    const graph = buildGraph();

    // Should handle the error and continue
    const result = await graph.invoke({
      packet: testPacket,
      artifacts: {},
      approvals: [],
      errors: [],
    });

    expect(result.packet.eventId).toBe("test_api_failure");
    // Workflow should still complete
    expect(result.artifacts.summary).toBeDefined();
  });
});
