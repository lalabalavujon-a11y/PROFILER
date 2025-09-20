# 🚀 ABM (Account-Based Marketing) System for Luxury Yacht Industry

**Transform your PROFILER system into a sophisticated Account-Based Marketing platform for the luxury yacht industry.**

## 🎯 Overview

This ABM system transforms your existing lead arbitrage model into a true Account-Based Marketing platform that:

- **Targets named accounts** instead of mass lead generation
- **Maps buying committees** across luxury yacht organizations
- **Tracks intent signals** from multiple touchpoints
- **Orchestrates personalized campaigns** based on account stage and intent
- **Attributes revenue** to specific accounts and campaigns
- **Provides executive insights** through real-time dashboards

## 🏗️ Architecture

### Core Components

1. **ABM Data Model** - Account-first architecture with Prisma
2. **Intent Signal Collection** - Multi-source intent tracking
3. **Play Orchestration** - Automated campaign execution
4. **Revenue Attribution** - Pipeline and expansion tracking
5. **Executive Dashboards** - Real-time insights and reporting

### Tech Stack

- **Database**: PostgreSQL with Prisma ORM
- **Frontend**: Next.js 14 with Server Components
- **Authentication**: Token-based ABM access
- **Automation**: n8n workflows for orchestration
- **CRM**: GoHighLevel integration
- **Task Management**: ClickUp integration
- **Notifications**: Slack webhooks
- **Email**: Resend for transactional emails

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Copy environment template
cp env.abm.example .env

# Generate secure tokens
openssl rand -base64 32  # For ABM_TOKEN
openssl rand -base64 32  # For ABM_HMAC_SECRET
```

### 2. Database Setup

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Seed sample data
pnpm seed-abm
```

### 3. Start Development

```bash
# Start the development server
pnpm dev

# Visit the ABM Hub
open http://localhost:3000/abm/hub
```

### 4. Authentication

Use your `ABM_TOKEN` as the `x-abm-token` header when accessing ABM endpoints:

```bash
curl -H "x-abm-token: YOUR_ABM_TOKEN" \
     http://localhost:3000/abm/hub
```

## 📊 ABM Data Model

### Core Entities

```typescript
// Account - The primary entity for ABM
model Account {
  id           String   @id @default(cuid())
  name         String   // "Monaco Yacht Services"
  domain       String?  // "https://monacoyachts.com"
  hqCity       String?  // "Monaco"
  region       String?  // "Europe"
  industry     String?  // "Luxury Yachts"
  tier         AccountTier // TARGET | STRATEGIC | EXPANSION
  status       AccountStatus // PROSPECT | ACTIVE | CHURN_RISK | CLOSED
  icpScore     Int      @default(0) // 0-100 firmographic fit
  abmStage     AbmStage // IDENTIFY | ENGAGE | ACTIVATE | CLOSE | EXPAND
  owners       Json?    // {marketing:"uid", sales:"uid"}
}

// Contact - Buying committee members
model Contact {
  id         String   @id @default(cuid())
  accountId  String
  firstName  String
  lastName   String
  title      String?  // "Managing Director"
  email      String?
  role       BuyingRole // ECONOMIC | TECHNICAL | CHAMPION | USER
  influence  Int      @default(0) // 0-100 influence score
}

// Intent Signal - Behavioral indicators
model IntentSignal {
  id         String   @id @default(cuid())
  accountId  String
  source     String   // "web", "qr", "newsletter", "events"
  signal     String   // "Viewed pricing page"
  weight     Int      @default(10) // Signal strength 1-100
  createdAt  DateTime @default(now())
}

// Opportunity - Revenue tracking
model Opportunity {
  id         String   @id @default(cuid())
  accountId  String
  name       String   // "Managed ABM Platform"
  stage      OppStage // QUALIFY | PROPOSE | NEGOTIATE | WON | LOST
  amount     Int?     // 500000 (in cents)
  currency   String?  // "EUR", "USD", "AED"
  closeDate  DateTime?
}
```

## 🎭 ABM Plays

### Core 5-Touch Play (14 days)

**Day 0**: Account brief email with region-specific insights
**Day 2**: LinkedIn outreach to Champion contact
**Day 5**: Value proposition video with case studies
**Day 8**: Physical 1-pager with QR tracking
**Day 12**: Executive email with ROI calculations

### Show-Window Play (±30 days around events)

- **Pre-show**: Daily micro-insights and VIP invitations
- **During**: Tracked QR cards and meeting coordination
- **Post-show**: Follow-up sequences and pilot proposals

### Activation Play (Pilot Launch)

- **Setup**: Branded lead funnels and routing rules
- **Execution**: 2-week pilot with daily monitoring
- **Expansion**: Success metrics and contract negotiation

## 🔄 Intent Signal Sources

### Website Signals

- **High Intent**: `/pricing` (40 points), `/demo` (45 points)
- **Medium Intent**: `/abm` (30 points), `/contact` (35 points)
- **Low Intent**: `/directory` (25 points), `/` (10 points)

### QR Code Signals

- **Event QR**: 30 points per scan
- **Content QR**: 25 points per scan
- **Personalized QR**: 35 points per scan

### Email Signals

- **Newsletter CTA**: 15 points per click
- **Account Brief**: 20 points per open
- **Meeting Request**: 25 points per click

### Event Signals

- **Meeting Booked**: 50 points
- **Booth Visit**: 30 points
- **Speaking Engagement**: 40 points

### LinkedIn Signals

- **Content Engagement**: 20 points
- **Connection Accept**: 25 points
- **Message Reply**: 30 points

## 📈 Scoring & Routing Logic

### Account Fit (ICP Score)

```typescript
function calculateIcpScore(account) {
  let score = 0;

  // Industry match (30 points)
  if (account.industry === "Luxury Yachts") score += 30;

  // Region match (20 points)
  if (["Europe", "North America", "Middle East"].includes(account.region))
    score += 20;

  // Fleet size (25 points)
  if (account.fleetSize > 50) score += 25;

  // Exhibitor status (15 points)
  if (account.isExhibitor) score += 15;

  // Website signals (10 points)
  if (account.hasWebsite) score += 10;

  return Math.min(score, 100);
}
```

### Intent Score (Rolling 30 days)

```typescript
function calculateIntentScore(accountId) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  return intentSignals
    .filter((signal) => signal.accountId === accountId)
    .filter((signal) => signal.createdAt >= thirtyDaysAgo)
    .reduce((sum, signal) => sum + signal.weight, 0);
}
```

### Routing Rules

- **High Fit + High Intent** (ICP ≥ 70, Intent ≥ 60): Activate play + AE assignment
- **Intent Spike** (z-score ≥ 2): Slack alert + immediate action
- **Account Lead**: Auto-attach to Account, create/advance Opportunity

## 🔧 API Endpoints

### Account Management

```bash
# Get all accounts
GET /api/abm/accounts?tier=STRATEGIC&stage=ENGAGE

# Create account
POST /api/abm/accounts
{
  "name": "Monaco Yacht Services",
  "domain": "https://monacoyachts.com",
  "industry": "Luxury Yachts",
  "tier": "STRATEGIC"
}

# Update account
PUT /api/abm/accounts?id=account_id
{
  "abmStage": "ACTIVATE",
  "icpScore": 85
}
```

### Intent Signals

```bash
# Record intent signal
POST /api/abm/intent
{
  "accountId": "account_id",
  "source": "web",
  "signal": "Viewed pricing page",
  "weight": 40,
  "meta": {"page": "/pricing", "duration": 180}
}

# Get intent signals
GET /api/abm/intent?accountId=account_id&days=30
```

### Stage Advancement

```bash
# Advance account stage
POST /api/abm/advance
{
  "accountId": "account_id",
  "toStage": "ACTIVATE",
  "reason": "High intent detected",
  "actor": "system"
}
```

### Email Campaigns

```bash
# Send ABM email
POST /api/abm/send-email
{
  "accountId": "account_id",
  "template": "account_brief",
  "actor": "marketing_rep"
}
```

## 🤖 n8n Workflows

### Account Enrichment

- **Trigger**: Webhook with target list
- **Process**: Enrich with firmographic data
- **Output**: Create accounts with ICP scores

### Intent Collection

- **Trigger**: Multi-source webhooks (QR, web, email)
- **Process**: Standardize and weight signals
- **Output**: Store intent signals with metadata

### Play Orchestration

- **Trigger**: Hourly cron job
- **Process**: Analyze accounts and determine next actions
- **Output**: Execute plays (email, LinkedIn, stage advancement)

### Stage Change Bridge

- **Trigger**: Account stage advancement
- **Process**: Create ClickUp tasks and GHL pipeline updates
- **Output**: Multi-channel notifications and task creation

## 📊 Dashboards & Insights

### ABM Hub (`/abm/hub`)

- Account overview with ICP and intent scores
- Stage distribution and conversion metrics
- Quick actions for campaign management

### Account Detail (`/abm/[accountId]`)

- Buying committee mapping
- Opportunity pipeline
- Intent signal timeline
- Activity history

### Executive Insights (`/abm/insights`)

- Intent velocity charts
- Stage distribution
- Top performing accounts
- Conversion funnel metrics

### Weekly Exec Brief (`/api/abm/weekly`)

- Automated email with top 15 accounts by intent
- Week-over-week comparison
- Key insights and recommendations

## 🔗 Integrations

### GoHighLevel CRM

- **Pipeline**: ABM - Luxury Yachts with 4 stages
- **Custom Fields**: Account ID, ABM Stage, ICP Score, Intent Score
- **Workflows**: UTM intake, stage sync, lead routing

### ClickUp Task Management

- **Templates**: Core 5-Touch Play, Pilot Launch
- **Automation**: Auto-create tasks on stage changes
- **Custom Fields**: Account metadata and success metrics

### Slack Notifications

- **Channels**: #abm-alerts, #abm-intent, #abm-actions
- **Triggers**: Account creation, intent spikes, stage changes
- **Format**: Rich messages with action buttons

## 🚀 Deployment

### Environment Variables

```bash
# Required
ABM_TOKEN=your_secure_token
ABM_HMAC_SECRET=your_hmac_secret
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Optional Integrations
N8N_ABM_EVENT_URL=https://your-n8n.com/webhook/abm-events
RESEND_API_KEY=re_your_key
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
GHL_API_KEY=your_ghl_key
CLICKUP_API_TOKEN=your_clickup_token
```

### Database Migration

```bash
# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Seed with sample data
pnpm seed-abm
```

### n8n Workflow Import

1. Import `account_enrich.json`
2. Import `intent_collector.json`
3. Import `play_orchestrator.json`
4. Configure webhook URLs and credentials

## 📋 30/60/90 Implementation Plan

### Days 0-10: MVP ABM Enablement

- [ ] Add Prisma models and run migrations
- [ ] Build `/abm/hub` and `/abm/[account]` pages
- [ ] Create n8n Account Enrichment + Intent Collector
- [ ] Set up GHL ABM pipeline + custom fields
- [ ] Test with sample yacht industry accounts

### Days 11-30: Plays Live

- [ ] Launch Core 5-touch play on 20-50 accounts
- [ ] Set up Slack anomaly + daily digests
- [ ] Create 2 account-specific briefs and run 2 pilots
- [ ] Monitor and optimize play performance

### Days 31-60: Scale & Instrument

- [ ] Add show-mode accelerators for next events
- [ ] Build exec dashboard `/abm/insights`
- [ ] QA + security hardening
- [ ] Create documentation and SOPs

### Days 61-90: Expansion

- [ ] Add SDR sequences in ClickUp tasks
- [ ] Expand to second vertical (finance/insurance or refit)
- [ ] Introduce Success Plans for expansion
- [ ] Measure and optimize ROI

## 🎯 Success Metrics

### Coverage Metrics

- **% target accounts mapped** with ≥2 buying roles
- **Account penetration rate** by region/industry

### Engagement Metrics

- **MQAs (Marketing Qualified Accounts)**: ICP ≥ 70 && Intent ≥ 60
- **Email engagement rates** by play type
- **LinkedIn connection acceptance** rates

### Velocity Metrics

- **Days from Identify → Meeting**
- **Days from Meeting → Pilot**
- **Days from Pilot → Expansion**

### Conversion Metrics

- **Pilot → Expansion rate**
- **Win rate by segment**
- **Expansion revenue per account**

### Attribution Metrics

- **Influenced pipeline $** by channel/touch
- **Show-window lift** in intent scores
- **ROI per ABM campaign**

## 🔒 Security & Compliance

### Data Protection

- **GDPR Compliance**: Corporate emails only, legitimate interest basis
- **PII Minimization**: Store only role-relevant contact fields
- **Encryption**: All data encrypted at rest

### API Security

- **HMAC Verification**: All inbound webhooks
- **Token Authentication**: ABM endpoints protected
- **Rate Limiting**: API protection built-in

### Audit Trail

- **Activity Logging**: Every ABM state transition
- **Outreach Tracking**: All email sends logged
- **Change History**: Complete audit trail

## 🆘 Troubleshooting

### Common Issues

**Database Connection**

```bash
# Check Prisma connection
pnpm prisma studio

# Reset database
pnpm prisma migrate reset
```

**Authentication Errors**

```bash
# Verify ABM token
echo $ABM_TOKEN

# Check middleware
curl -H "x-abm-token: $ABM_TOKEN" http://localhost:3000/abm/hub
```

**n8n Workflow Issues**

- Check webhook URLs and credentials
- Verify event payload format
- Review n8n execution logs

**Email Delivery**

- Verify Resend API key
- Check email templates
- Review bounce/complaint rates

## 📞 Support

### Documentation

- [ABM Implementation Guide](ABM_IMPLEMENTATION_GUIDE.md)
- [Quick Start Guide](ABM_QUICK_START_GUIDE.md)
- [Best Practices](ABM_BEST_PRACTICES.md)
- [Workflow Diagrams](ABM_WORKFLOW_DIAGRAM.md)

### Getting Help

1. Check the troubleshooting section above
2. Review n8n workflow execution logs
3. Verify all environment variables are set
4. Contact development team with reproduction steps

---

## 🎉 Ready to Transform Your ABM Strategy!

This ABM system transforms your PROFILER from a lead generation tool into a sophisticated account-based marketing platform. You now have both **mass lead generation** AND **high-value account management** in one unified system.

**Go crush it in the luxury yacht market!** 🛥️⚓
