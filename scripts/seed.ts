import { buildGraph } from "../agents/conductor";

async function main() {
  console.log("🚀 Starting Lead Recon Demo Workflow");
  console.log("=====================================");

  const packet = {
    eventId: `evt_demo_${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    host: {
      name: "Lead Recon Expert",
      logoUrl: "https://example.com/logo.png",
      email: "expert@leadrecon.app",
      website: "https://leadrecon.app",
      payoutModel: "GHL_AFFILIATE" as const,
      commissionPct: 30,
      affiliateId: "aff_lead_recon_expert",
    },
    audience: {
      industry: "SaaS",
      size: "smb" as const,
      location: "US",
    },
    offer: {
      tripwirePrice: 297,
      tripwireCredits: 1000,
      bumpEnabled: true,
      bumpPrice: 99,
    },
    assets: {
      deckProvider: "both" as const,
      brandingPalette: ["#1f2937", "#3b82f6", "#10b981"],
      gammaTemplateId: "template_123",
    },
    leadSources: {
      crm: { type: "hubspot", apiKey: "demo_key" },
      social: { platforms: ["linkedin", "facebook"] },
      website: { analytics: "google" },
    },
  };

  const initialState = {
    packet,
    artifacts: {},
    approvals: [],
    errors: [],
  };

  console.log(`📋 Event ID: ${packet.eventId}`);
  console.log(
    `🎯 Target: ${packet.audience.industry} ${packet.audience.size} businesses`
  );
  console.log(
    `💰 Offer: $${packet.offer.tripwirePrice} for ${packet.offer.tripwireCredits} credits`
  );
  console.log(`📊 Deck Provider: ${packet.assets.deckProvider}`);
  console.log("");

  try {
    console.log("⏳ Executing workflow...");
    const startTime = Date.now();

    const graph = buildGraph();
    const result = await graph.invoke(initialState);

    const duration = Date.now() - startTime;

    console.log("");
    console.log("✅ Workflow Completed Successfully!");
    console.log(`⏱️  Total Processing Time: ${duration}ms`);
    console.log("");

    // Display results summary
    console.log("📈 RESULTS SUMMARY");
    console.log("==================");

    if (result.artifacts.profiler) {
      console.log(
        `👥 Total Leads Analyzed: ${result.artifacts.profiler.totalLeads}`
      );
      console.log(
        `🎯 Lead Segments Created: ${
          result.artifacts.profiler.segments?.length || 0
        }`
      );
      console.log(
        `⭐ High-Value Leads: ${result.artifacts.profiler.highValueLeads}`
      );
      console.log(
        `📊 Average Lead Score: ${
          result.artifacts.profiler.averageScore?.toFixed(3) || "N/A"
        }`
      );
      console.log("");
    }

    if (result.artifacts.deck) {
      console.log(`🎨 Active Deck Provider: ${result.artifacts.deck.active}`);
      console.log(`📑 Deck Generated: ${result.artifacts.deck ? "Yes" : "No"}`);
      console.log("");
    }

    if (result.artifacts.funnel) {
      console.log(
        `🌐 Funnel Created: ${result.artifacts.funnel ? "Yes" : "No"}`
      );
      console.log(
        `📈 Strategy: ${result.artifacts.funnel.strategy || "AI-Optimized"}`
      );
      console.log("");
    }

    if (result.artifacts.tracking) {
      console.log(`🔗 Affiliate Tracking: Configured`);
      console.log(
        `💰 Commission Rate: ${
          result.artifacts.tracking.commissionStructure?.commissionRate * 100 ||
          30
        }%`
      );
      console.log("");
    }

    if (result.artifacts.outreach) {
      console.log(
        `📧 Total Personalized Emails: ${
          result.artifacts.outreach.totalEmails || 0
        }`
      );
      console.log(
        `📊 Email Campaigns: ${
          result.artifacts.outreach.campaigns?.length || 0
        }`
      );
      console.log("");
    }

    console.log("🎉 Demo workflow completed successfully!");
    console.log("💡 Full results:");
    console.log(JSON.stringify(result.artifacts, null, 2));
  } catch (error) {
    console.error("");
    console.error("❌ Workflow execution failed:");
    console.error(error);
    process.exit(1);
  }
}

main().catch(console.error);
