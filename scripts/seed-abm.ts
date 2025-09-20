#!/usr/bin/env ts-node

/**
 * ABM Seed Script
 *
 * This script creates sample yacht industry accounts, contacts, and intent signals
 * for testing the ABM system.
 *
 * Usage:
 *   pnpm ts-node scripts/seed-abm.ts
 */

import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

// Load environment variables
config();

const prisma = new PrismaClient();

const SAMPLE_ACCOUNTS = [
  {
    name: "Monaco Yacht Services",
    domain: "https://monacoyachts.com",
    hqCity: "Monaco",
    region: "Europe",
    industry: "Luxury Yachts",
    tier: "STRATEGIC" as const,
    status: "ACTIVE" as const,
    icpScore: 95,
    abmStage: "ACTIVATE" as const,
    notes:
      "Premium yacht brokerage and management services in Monaco. Fleet of 200+ yachts.",
    contacts: [
      {
        firstName: "Jean-Pierre",
        lastName: "Dubois",
        title: "Managing Director",
        email: "jp.dubois@monacoyachts.com",
        role: "ECONOMIC" as const,
        influence: 100,
        engaged: true,
      },
      {
        firstName: "Sophie",
        lastName: "Martin",
        title: "Marketing Director",
        email: "sophie.martin@monacoyachts.com",
        role: "CHAMPION" as const,
        influence: 85,
        engaged: true,
      },
      {
        firstName: "Pierre",
        lastName: "Leroy",
        title: "IT Director",
        email: "pierre.leroy@monacoyachts.com",
        role: "TECHNICAL" as const,
        influence: 70,
        engaged: false,
      },
    ],
    opportunities: [
      {
        name: "Managed ABM Platform",
        stage: "NEGOTIATE" as const,
        amount: 500000,
        currency: "EUR",
        closeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    ],
  },
  {
    name: "Fort Lauderdale Yacht Group",
    domain: "https://flyachtgroup.com",
    hqCity: "Fort Lauderdale",
    region: "North America",
    industry: "Luxury Yachts",
    tier: "TARGET" as const,
    status: "PROSPECT" as const,
    icpScore: 78,
    abmStage: "ENGAGE" as const,
    notes:
      "Leading yacht brokerage in South Florida. Specializes in superyachts over 100ft.",
    contacts: [
      {
        firstName: "Michael",
        lastName: "Johnson",
        title: "CEO",
        email: "mjohnson@flyachtgroup.com",
        role: "ECONOMIC" as const,
        influence: 100,
        engaged: true,
      },
      {
        firstName: "Sarah",
        lastName: "Williams",
        title: "Sales Director",
        email: "swilliams@flyachtgroup.com",
        role: "USER" as const,
        influence: 75,
        engaged: true,
      },
    ],
    opportunities: [
      {
        name: "Lead Generation Pilot",
        stage: "PROPOSE" as const,
        amount: 250000,
        currency: "USD",
        closeDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      },
    ],
  },
  {
    name: "Dubai Marina Yachts",
    domain: "https://dubaimarinayachts.ae",
    hqCity: "Dubai",
    region: "Middle East",
    industry: "Luxury Yachts",
    tier: "STRATEGIC" as const,
    status: "ACTIVE" as const,
    icpScore: 88,
    abmStage: "CLOSE" as const,
    notes:
      "Premium yacht services in Dubai Marina. Growing fleet and expanding to Abu Dhabi.",
    contacts: [
      {
        firstName: "Ahmed",
        lastName: "Al-Rashid",
        title: "Managing Partner",
        email: "ahmed@dubaimarinayachts.ae",
        role: "ECONOMIC" as const,
        influence: 100,
        engaged: true,
      },
      {
        firstName: "Fatima",
        lastName: "Hassan",
        title: "Business Development Manager",
        email: "fatima@dubaimarinayachts.ae",
        role: "CHAMPION" as const,
        influence: 90,
        engaged: true,
      },
    ],
    opportunities: [
      {
        name: "Full ABM Suite",
        stage: "WON" as const,
        amount: 750000,
        currency: "AED",
        closeDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Won 7 days ago
      },
    ],
  },
];

async function createSampleData() {
  console.log("🚀 Creating ABM sample data...");

  try {
    // Create accounts with contacts and opportunities
    for (const accountData of SAMPLE_ACCOUNTS) {
      const { contacts, opportunities, ...accountInfo } = accountData;

      const account = await prisma.account.create({
        data: {
          ...accountInfo,
          contacts: {
            create: contacts,
          },
          opportunities: {
            create: opportunities,
          },
        },
      });

      console.log(`✅ Created account: ${account.name} (${account.abmStage})`);

      // Create some sample intent signals
      const intentSignals = [
        {
          source: "web",
          signal: "Viewed pricing page",
          weight: 40,
          meta: { page: "/pricing", duration: 180 },
        },
        {
          source: "qr",
          signal: "QR scan - GOLD deck at Monaco Yacht Show",
          weight: 30,
          meta: { event: "Monaco Yacht Show 2024", location: "Stand B-15" },
        },
        {
          source: "newsletter",
          signal: "Newsletter CTA clicked: 'Start Your Pilot'",
          weight: 15,
          meta: { campaign: "Q4 ABM Launch", cta: "Start Your Pilot" },
        },
        {
          source: "events",
          signal: "Meeting booked at Fort Lauderdale Boat Show",
          weight: 50,
          meta: { event: "FLIBS 2024", meetingType: "demo" },
        },
        {
          source: "linkedin",
          signal: "LinkedIn engagement: liked ABM case study post",
          weight: 20,
          meta: { action: "like", postId: "abm-case-study-2024" },
        },
      ];

      // Create intent signals for the last 30 days
      for (let i = 0; i < intentSignals.length; i++) {
        const signal = intentSignals[i];
        const daysAgo = Math.floor(Math.random() * 30);
        const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

        await prisma.intentSignal.create({
          data: {
            accountId: account.id,
            ...signal,
            createdAt,
          },
        });
      }

      // Create some sample activities
      const activities = [
        {
          channel: "email",
          action: "sent",
          actor: "system",
          meta: {
            template: "account_brief",
            subject: "Yacht Industry Insights",
          },
        },
        {
          channel: "linkedin",
          action: "connected",
          actor: "sales_rep",
          meta: { contact: "Jean-Pierre Dubois" },
        },
        {
          channel: "call",
          action: "completed",
          actor: "sales_rep",
          meta: { duration: 25, outcome: "positive" },
        },
      ];

      for (const activity of activities) {
        const daysAgo = Math.floor(Math.random() * 14);
        const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

        await prisma.activity.create({
          data: {
            accountId: account.id,
            ...activity,
            createdAt,
          },
        });
      }

      // Create account segments
      const segments = [
        { name: "Brokerage-Top25" },
        { name: `${account.region}-Premium` },
        { name: "Show-Exhibitor" },
      ];

      for (const segment of segments) {
        await prisma.accountSegment.create({
          data: {
            accountId: account.id,
            name: segment.name,
          },
        });
      }

      console.log(
        `  📊 Created ${intentSignals.length} intent signals, ${activities.length} activities, ${segments.length} segments`
      );
    }

    console.log("\n🎉 ABM sample data created successfully!");
    console.log("\n📋 Summary:");
    console.log(`- ${SAMPLE_ACCOUNTS.length} accounts created`);
    console.log(
      `- ${SAMPLE_ACCOUNTS.reduce(
        (sum, acc) => sum + acc.contacts.length,
        0
      )} contacts created`
    );
    console.log(
      `- ${SAMPLE_ACCOUNTS.reduce(
        (sum, acc) => sum + acc.opportunities.length,
        0
      )} opportunities created`
    );
    console.log(`- ${SAMPLE_ACCOUNTS.length * 5} intent signals created`);
    console.log(`- ${SAMPLE_ACCOUNTS.length * 3} activities created`);
    console.log(`- ${SAMPLE_ACCOUNTS.length * 3} account segments created`);

    console.log("\n🚀 Next steps:");
    console.log("1. Start your development server: pnpm dev");
    console.log("2. Visit: http://localhost:3000/abm/hub");
    console.log(
      "3. Use the ABM_TOKEN from your .env file as the x-abm-token header"
    );
    console.log("4. Explore the sample accounts and their intent signals");
  } catch (error) {
    console.error("❌ Error creating sample data:", error);
    throw error;
  }
}

async function main() {
  console.log("🎯 ABM Seed Script");
  console.log("==================\n");

  try {
    await createSampleData();
  } catch (error) {
    console.error("\n💥 Seed script failed:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed script
main().catch(console.error);
