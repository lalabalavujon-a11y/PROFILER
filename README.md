# 🚀 PROFILER - AI-Powered Lead Recon System

**Enterprise-grade lead intelligence automation with AI-powered analysis, multi-channel outreach, and conversion optimization.**

## 🎯 System Overview

The PROFILER is a comprehensive Lead Recon automation system that transforms raw lead data into qualified prospects through:

- **🧠 AI-Powered Lead Analysis** - GPT-4 driven scoring and segmentation
- **📊 Multi-Provider Deck Generation** - Google Slides + Gamma integration
- **🌐 Conversion-Optimized Funnels** - Automated landing pages and checkout flows
- **🤖 Multi-Channel Automation** - Email, SMS, Social, and CRM integration
- **📈 Real-Time Analytics** - LangSmith observability and performance tracking

## ⚡ Quick Start

### Prerequisites

**🚨 REQUIRED: Node.js 22.12.0+**

```bash
# Check your Node.js version
node --version  # Must be v22.12.0 or higher

# Auto-setup Node.js 22 (if needed)
npm run setup
```

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd PROFILER

# Install dependencies
pnpm install

# Run environment check
pnpm check-node

# Start development
pnpm dev
```

### Quick Test

```bash
# Run test suite
pnpm test

# Execute demo workflow
pnpm seed
```

## 🏗️ Architecture

### Core Components

1. **🔍 Profiler Agent** - AI lead analysis and segmentation
2. **🎨 Deck Generators** - Google Slides + Gamma presentation creation
3. **🌐 Funnel Builder** - Landing pages, checkout, and conversion optimization
4. **🔗 Affiliate System** - UTM tracking and commission management
5. **📧 Outreach Engine** - Personalized multi-channel campaigns
6. **📊 Analytics Hub** - LangSmith integration and performance monitoring

### Workflow Pipeline

```
📥 Lead Data → 🧠 AI Analysis → 🎯 Segmentation → 🎨 Deck Creation →
🌐 Funnel Build → 🔗 Affiliate Setup → 📧 Outreach Launch → 📈 Analytics
```

## 🚀 Features

### 🧠 AI-Powered Lead Intelligence

- **Smart Lead Scoring** - GPT-4 powered qualification
- **Dynamic Segmentation** - Industry and behavior-based grouping
- **Personalized Messaging** - AI-generated content for each segment
- **Predictive Analytics** - Conversion probability scoring

### 📊 Multi-Provider Deck Generation

- **Google Slides Integration** - Full API with PDF export
- **Gamma AI Decks** - AI-powered presentation creation
- **Dual Provider Support** - Generate both simultaneously
- **Brand Customization** - Logo, colors, and template integration

### 🌐 Conversion-Optimized Funnels

- **AI-Generated Landing Pages** - Psychology-based copy optimization
- **Stripe Integration** - Secure payment processing with bump offers
- **A/B Testing Ready** - Multiple variation support
- **Mobile Responsive** - Cross-device optimization

### 🤖 Advanced Automation (MCP + Rube.io)

- **Multi-Channel Outreach** - Email, SMS, LinkedIn, Facebook
- **CRM Synchronization** - HubSpot, Salesforce, Pipedrive
- **Social Media Campaigns** - Automated posting and engagement
- **Nurturing Sequences** - Behavior-triggered follow-ups

### 📈 Enterprise Observability

- **LangSmith Integration** - Complete workflow tracing
- **Performance Analytics** - Success rates, duration, ROI tracking
- **Error Monitoring** - Comprehensive logging and alerting
- **Custom Dashboards** - Real-time metrics and insights

## 🛠️ Environment Setup

### 1. Node.js 22 (Required)

```bash
# Automatic setup
pnpm setup

# Manual verification
node --version  # v22.12.0+
pnpm --version  # 9.0.0+
```

### 2. Environment Variables

Copy `env.example` to `.env` and configure:

```bash
# LangChain & LangSmith
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langsmith_api_key
LANGCHAIN_PROJECT=profiler-lead-recon

# AI Services
OPENAI_API_KEY=your_openai_api_key

# Presentation Services
GAMMA_API_KEY=your_gamma_api_key
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

# Storage & Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Automation Platform
RUBE_API_KEY=your_rube_api_key
ENABLE_MCP_RUBE=true

# Feature Flags
GAMMA_ENABLED=true
DEFAULT_DECK_PROVIDER=gamma
```

### 3. Service Integrations

#### Deck Providers

- **Google Slides**: Configure service account and API access
- **Gamma**: Set up API key and template access

#### Storage

- **Supabase**: Configure storage bucket for assets

#### Automation

- **app.Rube.io**: Set up MCP integration for multi-channel automation

## 📋 Usage

### Basic Workflow

```typescript
import { buildGraph } from "./agents/conductor";

const packet = {
  eventId: "evt_demo_123",
  host: { name: "Lead Expert", commissionPct: 30 },
  audience: { industry: "SaaS", size: "smb" },
  offer: { tripwirePrice: 297, tripwireCredits: 1000 },
  assets: { deckProvider: "both" },
};

const graph = buildGraph();
const result = await graph.invoke({
  packet,
  artifacts: {},
  approvals: [],
  errors: [],
});
```

### API Endpoints

```bash
# Process lead recon event
POST /api/run-event
{
  "packet": { /* event data */ }
}

# Upload lead batch
POST /api/leads/upload
{
  "leads": [ /* lead array */ ],
  "eventId": "evt_123"
}

# Get analytics
GET /api/analytics/evt_123
```

### Docker Deployment

```bash
# Development
docker-compose --profile dev up

# Production
docker-compose up --build
```

## 🧪 Testing

### Test Suite

```bash
# Run all tests
pnpm test

# Integration tests
pnpm test test/integration.test.ts

# Specific test file
pnpm test test/deck.gamma.test.ts
```

### Demo Workflow

```bash
# Execute complete demo
pnpm seed

# Check Node.js environment
pnpm check-node
```

## 🚀 Deployment

### Supported Platforms

- **Cloudflare Workers** - Recommended for global edge deployment
- **Vercel** - Serverless functions with Node.js 22
- **AWS Lambda** - Enterprise-grade serverless
- **Docker** - Container-based deployment
- **Traditional VPS** - Full control deployment

### CI/CD Pipeline

- **GitHub Actions** - Automated testing and deployment
- **Docker Multi-stage** - Optimized production builds
- **Environment Promotion** - Dev → Staging → Production

## 📊 Performance

### Benchmarks

- **Lead Processing**: 50+ leads per batch
- **Deck Generation**: ~30 seconds per deck
- **Funnel Creation**: ~15 seconds end-to-end
- **API Response**: <2 seconds average
- **Memory Usage**: ~200MB baseline

### Scalability

- **Horizontal Scaling**: Stateless architecture
- **Queue Support**: Background job processing
- **Rate Limiting**: Built-in API protection
- **Caching**: Redis integration ready

## 🔧 Development

### Project Structure

```
├── agents/          # LangGraph workflow agents
├── api/             # REST API endpoints
├── contracts/       # TypeScript interfaces
├── lib/             # Utility libraries
├── scripts/         # Development and setup scripts
├── test/            # Test suites
└── docs/            # Documentation
```

### Adding New Agents

1. Create agent in `agents/` directory
2. Add to conductor workflow
3. Update contracts and types
4. Write comprehensive tests

### Contributing

1. Ensure Node.js 22.12.0+
2. Follow TypeScript strict mode
3. Write tests for new features
4. Update documentation

## 📞 Support & Troubleshooting

### Common Issues

- **Node.js Version**: Run `pnpm check-node` for diagnostics
- **Dependencies**: Clear cache with `pnpm store prune`
- **Environment**: Verify all required variables are set
- **API Keys**: Check service integrations and quotas

### Getting Help

1. Check the [Node.js Setup Guide](docs/NODE_SETUP.md)
2. Review error logs and stack traces
3. Run environment diagnostics
4. Contact development team with reproduction steps

## 📈 Roadmap

### Upcoming Features

- [ ] Multi-language support
- [ ] Advanced A/B testing
- [ ] Custom ML models
- [ ] Enhanced analytics dashboard
- [ ] Mobile app integration

### Performance Improvements

- [ ] Edge caching optimization
- [ ] Database query optimization
- [ ] Real-time streaming updates
- [ ] Advanced error recovery

---

## 🏆 Built With

- **Node.js 22** - Runtime environment
- **TypeScript** - Type-safe development
- **LangChain** - AI orchestration framework
- **LangSmith** - Observability and monitoring
- **Vitest** - Testing framework
- **pnpm** - Package management
- **Docker** - Containerization
- **GitHub Actions** - CI/CD pipeline

**🎉 Ready to transform your lead generation with AI-powered intelligence!**
