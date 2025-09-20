import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const SendEmailSchema = z.object({
  accountId: z.string().min(1),
  contactId: z.string().optional(),
  template: z.enum([
    "account_brief",
    "pilot_invite",
    "meeting_request",
    "follow_up",
  ]),
  subject: z.string().optional(),
  customMessage: z.string().optional(),
  actor: z.string().default("system"),
});

const EMAIL_TEMPLATES = {
  account_brief: {
    subject:
      "A faster path to booked viewings in {{region}} — 14-day pilot for {{account}}",
    template: `
Hi {{firstName}},

We analyzed demand signals in {{region}} around {{show_or_port}}. Your team is well-positioned, but buyers are fragmenting across directories, show content, and local guides.

We propose a 14-day pilot using your brand:
• Route only qualified inquiries (LOA/budget/timeframe) to your CRM
• ABM microsite with your offers + booking
• Daily insights + Slack alerts on intent spikes

If the pilot doesn't produce booked meetings, you don't continue.

Can we share your {{account}} briefing and proposed workflow (10 mins)?

— LEAD RECON
    `,
  },
  pilot_invite: {
    subject: "14-Day Pilot Invitation - {{account}}",
    template: `
Hi {{firstName}},

Ready to start your 14-day pilot?

Markets: {{2–3 cities}}
Lines: {{brokerage|charter|refit}}
SLA: <5 minutes first response, routing rules by LOA/segment
KPIs: meetings, qualified rate, opp value, expansion trigger

Let's schedule your kickoff call this week.

— LEAD RECON
    `,
  },
  meeting_request: {
    subject: "Quick 20-min Working Session - {{account}}",
    template: `
Hi {{firstName}},

I'd like to show you how we can increase your qualified viewings by 40% in the next quarter.

20-minute working session to discuss:
• Your current lead quality challenges
• Our proven yacht industry pipeline
• Immediate next steps

Available this week:
[Calendar Link]

— LEAD RECON
    `,
  },
  follow_up: {
    subject: "Following up on {{account}} opportunity",
    template: `
Hi {{firstName}},

Following up on our conversation about improving your yacht sales pipeline.

Quick question: What's your biggest challenge with lead quality right now?

Happy to share some insights that might help.

— LEAD RECON
    `,
  },
};

function isAuthorized(request: NextRequest): boolean {
  const token = request.headers.get("x-abm-token");
  return token === process.env.ABM_TOKEN;
}

function renderTemplate(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(
    /\{\{(\w+)\}\}/g,
    (match, key) => variables[key] || match
  );
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { accountId, contactId, template, subject, customMessage, actor } =
      SendEmailSchema.parse(body);

    // Get account and contact
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: {
        contacts: true,
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const contact = contactId
      ? await prisma.contact.findFirst({
          where: { id: contactId, accountId },
        })
      : account.contacts.find((c) => c.role === "CHAMPION") ||
        account.contacts[0];

    if (!contact || !contact.email) {
      return NextResponse.json(
        { error: "No valid contact email found" },
        { status: 400 }
      );
    }

    // Get template
    const emailTemplate = EMAIL_TEMPLATES[template];
    const variables = {
      firstName: contact.firstName,
      account: account.name,
      region: account.region || "your region",
      industry: account.industry || "yacht industry",
    };

    const finalSubject =
      subject || renderTemplate(emailTemplate.subject, variables);
    const finalMessage =
      customMessage || renderTemplate(emailTemplate.template, variables);

    // Log the email activity
    await prisma.activity.create({
      data: {
        accountId,
        channel: "email",
        action: "sent",
        actor,
        meta: {
          template,
          subject: finalSubject,
          contactId: contact.id,
          contactEmail: contact.email,
        },
      },
    });

    // In a real implementation, you'd send the email here using Resend, SendGrid, etc.
    // For now, we'll just log it
    console.log("Email would be sent:", {
      to: contact.email,
      subject: finalSubject,
      body: finalMessage,
    });

    // Emit email event to n8n for actual sending
    if (process.env.N8N_ABM_EVENT_URL) {
      try {
        await fetch(process.env.N8N_ABM_EVENT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "email_send",
            data: {
              accountId,
              contactId: contact.id,
              to: contact.email,
              subject: finalSubject,
              body: finalMessage,
              template,
              actor,
            },
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (eventError) {
        console.error("Failed to emit email event to n8n:", eventError);
      }
    }

    return NextResponse.json({
      data: {
        success: true,
        email: {
          to: contact.email,
          subject: finalSubject,
          template,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
