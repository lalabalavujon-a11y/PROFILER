#!/usr/bin/env ts-node

/**
 * GHL (GoHighLevel) ABM Pipeline Setup Script
 *
 * This script creates the ABM pipeline, stages, and custom fields in GoHighLevel
 * for the luxury yacht industry ABM system.
 *
 * Usage:
 *   pnpm ts-node scripts/setup-ghl.ts
 *
 * Environment Variables Required:
 *   GHL_API_KEY - Your GoHighLevel API key
 *   GHL_LOCATION_ID - Your location ID
 */

import axios from "axios";
import { config } from "dotenv";

// Load environment variables
config();

interface GHLStage {
  id: string;
  name: string;
  position: number;
}

interface GHLField {
  id: string;
  name: string;
  type: string;
}

interface GHLPipeline {
  id: string;
  name: string;
  stages: GHLStage[];
  fields: GHLField[];
}

const GHL_API_BASE = "https://rest.gohighlevel.com/v1";
const API_KEY = process.env.GHL_API_KEY;
const LOCATION_ID = process.env.GHL_LOCATION_ID;

if (!API_KEY || !LOCATION_ID) {
  console.error("❌ Missing required environment variables:");
  console.error("   GHL_API_KEY - Your GoHighLevel API key");
  console.error("   GHL_LOCATION_ID - Your location ID");
  console.error("\nAdd these to your .env file and run again.");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

async function createABMPipeline(): Promise<GHLPipeline> {
  console.log("🚀 Creating ABM Pipeline in GoHighLevel...");

  try {
    // Create the main ABM pipeline
    const pipelineResponse = await axios.post(
      `${GHL_API_BASE}/pipelines`,
      {
        name: "ABM - Luxury Yachts",
        locationId: LOCATION_ID,
        description:
          "Account-Based Marketing pipeline for luxury yacht industry prospects",
      },
      { headers }
    );

    const pipeline = pipelineResponse.data.pipeline;
    console.log(`✅ Created pipeline: ${pipeline.name} (ID: ${pipeline.id})`);

    // Create stages
    const stages = [
      { name: "Engaged", position: 1 },
      { name: "Meeting", position: 2 },
      { name: "Pilot Live", position: 3 },
      { name: "Expansion", position: 4 },
    ];

    const createdStages: GHLStage[] = [];
    for (const stage of stages) {
      const stageResponse = await axios.post(
        `${GHL_API_BASE}/pipelines/${pipeline.id}/stages`,
        {
          name: stage.name,
          position: stage.position,
        },
        { headers }
      );

      const createdStage = stageResponse.data.stage;
      createdStages.push({
        id: createdStage.id,
        name: createdStage.name,
        position: createdStage.position,
      });

      console.log(
        `✅ Created stage: ${createdStage.name} (ID: ${createdStage.id})`
      );
    }

    // Create custom fields
    const fields = [
      { name: "Account ID", type: "text" },
      { name: "Account Name", type: "text" },
      { name: "ABM Stage", type: "dropdown" },
      { name: "ICP Score", type: "number" },
      { name: "Intent Score", type: "number" },
    ];

    const createdFields: GHLField[] = [];
    for (const field of fields) {
      const fieldResponse = await axios.post(
        `${GHL_API_BASE}/pipelines/${pipeline.id}/fields`,
        {
          name: field.name,
          type: field.type,
          ...(field.type === "dropdown" && field.name === "ABM Stage"
            ? {
                options: ["IDENTIFY", "ENGAGE", "ACTIVATE", "CLOSE", "EXPAND"],
              }
            : {}),
        },
        { headers }
      );

      const createdField = fieldResponse.data.field;
      createdFields.push({
        id: createdField.id,
        name: createdField.name,
        type: createdField.type,
      });

      console.log(
        `✅ Created field: ${createdField.name} (ID: ${createdField.id})`
      );
    }

    return {
      id: pipeline.id,
      name: pipeline.name,
      stages: createdStages,
      fields: createdFields,
    };
  } catch (error) {
    console.error(
      "❌ Error creating ABM pipeline:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function createWorkflows(pipeline: GHLPipeline) {
  console.log("\n🔧 Creating ABM Workflows...");

  try {
    // Create UTM intake workflow
    const utmWorkflow = await axios.post(
      `${GHL_API_BASE}/workflows`,
      {
        name: "ABM UTM Intake & Tagging",
        locationId: LOCATION_ID,
        triggerType: "form_submit",
        description:
          "Automatically tags contacts with ABM data from UTM parameters",
      },
      { headers }
    );

    console.log(`✅ Created UTM workflow: ${utmWorkflow.data.workflow.name}`);

    // Create stage sync workflow
    const stageWorkflow = await axios.post(
      `${GHL_API_BASE}/workflows`,
      {
        name: "ABM Stage Sync",
        locationId: LOCATION_ID,
        triggerType: "contact_update",
        description: "Syncs ABM stage changes with external systems",
      },
      { headers }
    );

    console.log(
      `✅ Created stage sync workflow: ${stageWorkflow.data.workflow.name}`
    );

    // Create route-by-account workflow
    const routeWorkflow = await axios.post(
      `${GHL_API_BASE}/workflows`,
      {
        name: "ABM Route by Account",
        locationId: LOCATION_ID,
        triggerType: "contact_create",
        description:
          "Routes leads to appropriate account owners based on account ID",
      },
      { headers }
    );

    console.log(
      `✅ Created routing workflow: ${routeWorkflow.data.workflow.name}`
    );
  } catch (error) {
    console.error(
      "❌ Error creating workflows:",
      error.response?.data || error.message
    );
  }
}

async function main() {
  console.log("🎯 GHL ABM Pipeline Setup");
  console.log("========================\n");

  try {
    const pipeline = await createABMPipeline();
    await createWorkflows(pipeline);

    console.log("\n🎉 ABM Pipeline Setup Complete!");
    console.log("\n📋 Configuration Summary:");
    console.log("========================");
    console.log(`Pipeline ID: ${pipeline.id}`);
    console.log(`Pipeline Name: ${pipeline.name}`);

    console.log("\n📊 Stages:");
    pipeline.stages.forEach((stage) => {
      console.log(`  - ${stage.name}: ${stage.id}`);
    });

    console.log("\n🏷️  Custom Fields:");
    pipeline.fields.forEach((field) => {
      console.log(`  - ${field.name} (${field.type}): ${field.id}`);
    });

    console.log("\n⚙️  Environment Variables to Add:");
    console.log("================================");
    console.log(`GHL_PIPELINE_ID=${pipeline.id}`);
    console.log(
      `GHL_STAGE_ID_ENGAGED=${
        pipeline.stages.find((s) => s.name === "Engaged")?.id
      }`
    );
    console.log(
      `GHL_STAGE_ID_MEETING=${
        pipeline.stages.find((s) => s.name === "Meeting")?.id
      }`
    );
    console.log(
      `GHL_STAGE_ID_PILOT_LIVE=${
        pipeline.stages.find((s) => s.name === "Pilot Live")?.id
      }`
    );
    console.log(
      `GHL_STAGE_ID_EXPANSION=${
        pipeline.stages.find((s) => s.name === "Expansion")?.id
      }`
    );
    console.log(
      `GHL_CF_ACCOUNT_ID=${
        pipeline.fields.find((f) => f.name === "Account ID")?.id
      }`
    );
    console.log(
      `GHL_CF_ACCOUNT_NAME=${
        pipeline.fields.find((f) => f.name === "Account Name")?.id
      }`
    );
    console.log(
      `GHL_CF_ABM_STAGE=${
        pipeline.fields.find((f) => f.name === "ABM Stage")?.id
      }`
    );
    console.log(
      `GHL_CF_ICP_SCORE=${
        pipeline.fields.find((f) => f.name === "ICP Score")?.id
      }`
    );
    console.log(
      `GHL_CF_INTENT_SCORE=${
        pipeline.fields.find((f) => f.name === "Intent Score")?.id
      }`
    );

    console.log("\n📝 Next Steps:");
    console.log("==============");
    console.log("1. Add the environment variables above to your .env file");
    console.log("2. Update n8n workflows with the new IDs");
    console.log("3. Test the pipeline with a sample contact");
    console.log("4. Configure your ABM campaigns to use the new pipeline");
  } catch (error) {
    console.error("\n💥 Setup failed:", error.message);
    process.exit(1);
  }
}

// Run the setup
main().catch(console.error);
