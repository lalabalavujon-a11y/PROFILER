# 🎯 Lead Recon Agents - Business Intelligence System

## Overview

The Lead Recon Agents are a comprehensive suite of AI-powered business intelligence tools integrated into the PROFILER system. These agents mirror the functionality of the original Lead Recon GPTs and provide advanced lead generation, client profiling, marketing strategy, and content creation capabilities.

## 🚀 Available Agents

### 1. The Profiler Agent

**Purpose**: Builds ideal client profiles using website input and strategic questioning

**Location**: `/agents/lead-recon-profiler.ts`
**API Endpoint**: `/api/lead-recon/profiler`

**Key Features**:

- Website analysis and business data extraction
- Strategic question generation for client profiling
- Ideal client profile creation
- Client persona development
- Comprehensive profiling reports

**Input Requirements**:

- Business information (name, industry, services, value proposition)
- Website URL (optional)
- Target market and audience data
- Lead source configurations

**Output Artifacts**:

- `idealClientProfiles`: Detailed client profiles with demographics, psychographics, and behavioral patterns
- `clientPersonas`: Buyer personas with backgrounds, goals, and communication preferences
- `strategicQuestions`: Framework of questions for client discovery
- `businessAnalysis`: Comprehensive business context analysis
- `reportUrl`: JSON report with all profiling data

### 2. The Strategist Agent

**Purpose**: Your ultimate marketing strategist to help you connect with ideal clients

**Location**: `/agents/lead-recon-strategist.ts`
**API Endpoint**: `/api/lead-recon/strategist`

**Key Features**:

- Market positioning and competitive analysis
- Comprehensive marketing strategy development
- Client connection strategies
- Channel-specific marketing approaches
- Implementation roadmap creation

**Input Requirements**:

- Business context and market information
- Marketing goals and objectives
- Budget and resource constraints
- Target audience and market data

**Output Artifacts**:

- `marketingStrategy`: Complete marketing strategy with objectives, positioning, and tactics
- `connectionStrategies`: Phase-based client connection approaches
- `channelStrategies`: Platform-specific marketing strategies
- `implementationRoadmap`: Step-by-step implementation plan
- `marketAnalysis`: Competitive landscape and market insights

### 3. DM Message Breakthrough Agent

**Purpose**: Get the attention of your dream prospects with smart messaging

**Location**: `/agents/lead-recon-dm-breakthrough.ts`
**API Endpoint**: `/api/lead-recon/dm-breakthrough`

**Key Features**:

- Prospect communication pattern analysis
- Breakthrough messaging strategies
- Personalized message templates
- Attention-grabbing hooks and openers
- Follow-up sequence development

**Input Requirements**:

- Prospect information (name, company, role, industry)
- Communication context and preferences
- Business services and value proposition
- Previous interaction history

**Output Artifacts**:

- `breakthroughStrategies`: Proven messaging approaches for prospect engagement
- `messageTemplates`: Ready-to-use message templates for different scenarios
- `attentionHooks`: Subject lines and opening statements that grab attention
- `followUpSequences`: Structured follow-up campaigns
- `messageVariations`: A/B testing variations for optimization

### 4. The Content Creator Agent

**Purpose**: Tailored content creator working from your ideal clients and media preferences

**Location**: `/agents/lead-recon-content-creator.ts`
**API Endpoint**: `/api/lead-recon/content-creator`

**Key Features**:

- Client media consumption analysis
- Content strategy development
- Content calendar creation
- Multi-format content generation
- Distribution strategy planning

**Input Requirements**:

- Business and brand information
- Content goals and requirements
- Audience demographics and preferences
- Competitor content analysis

**Output Artifacts**:

- `contentStrategy`: Comprehensive content strategy with pillars and themes
- `contentCalendar`: Monthly and quarterly content planning
- `contentPieces`: Specific content pieces (blog posts, social media, videos)
- `contentTemplates`: Reusable content templates and frameworks
- `distributionStrategy`: Multi-channel content distribution plan

### 5. The Prompt Wizard Agent

**Purpose**: Your intelligent assistant for creating high-impact AI prompts for prospecting leads using Lead Recon Pro data

**Location**: `/agents/lead-recon-prompt-wizard.ts`
**API Endpoint**: `/api/lead-recon/prompt-wizard`

**Key Features**:

- User intent analysis and prompt generation
- Variable analysis for Lead Recon Pro integration
- Prompt variations and optimization suggestions
- Ready-to-use prompt templates
- Copy-paste ready AI prompts

**Input Requirements**:

- User request or intent description
- Lead data context (website, company, contact info)
- Prompt requirements (tone, complexity, length)
- Use case and examples

**Output Artifacts**:

- `generatedPrompt`: Primary AI prompt ready for Lead Recon Pro
- `promptVariations`: Multiple variations for different scenarios
- `promptTemplates`: Pre-built templates for common use cases
- `optimizationSuggestions`: Best practices and improvement recommendations
- `variableAnalysis`: Analysis of required Lead Recon Pro variables

## 🔧 Integration with PROFILER System

### Conductor Integration

All Lead Recon agents are integrated into the main conductor workflow (`/agents/conductor.ts`):

```typescript
// Agents run in parallel with existing profiler
g.addEdge(START, "leadReconProfiler");
g.addEdge(START, "leadReconStrategist");
g.addEdge(START, "leadReconDMBreakthrough");
g.addEdge(START, "leadReconContentCreator");
g.addEdge(START, "leadReconPromptWizard");
```

### Artifacts Contract

The `Artifacts` contract (`/contracts/Artifacts.ts`) has been updated to include all Lead Recon outputs:

```typescript
export type Artifacts = {
  // ... existing artifacts
  leadReconProfiler: {
    /* profiler outputs */
  };
  leadReconStrategist: {
    /* strategist outputs */
  };
  leadReconDMBreakthrough: {
    /* messaging outputs */
  };
  leadReconContentCreator: {
    /* content outputs */
  };
  leadReconPromptWizard: {
    /* prompt wizard outputs */
  };
};
```

## 📡 API Usage

### Authentication

All API endpoints require proper authentication and are integrated with the existing PROFILER authentication system.

### Request Format

All endpoints accept JSON requests with the following structure:

```json
{
  "eventId": "unique-event-identifier",
  "businessName": "Your Business Name",
  "industry": "Your Industry",
  "services": ["Service 1", "Service 2"],
  "valueProposition": "Your unique value proposition"
  // ... additional fields based on agent requirements
}
```

### Response Format

All endpoints return JSON responses with the following structure:

```json
{
  "success": true,
  "data": {
    // Agent-specific output data
  },
  "eventId": "unique-event-identifier"
}
```

## 🎯 Use Cases

### 1. Client Onboarding

Use The Profiler Agent to quickly understand new clients and build comprehensive profiles for better service delivery.

### 2. Marketing Strategy Development

Leverage The Strategist Agent to create comprehensive marketing strategies for client acquisition and growth.

### 3. Prospect Outreach

Utilize the DM Message Breakthrough Agent to create personalized, attention-grabbing messages for prospect engagement.

### 4. Content Marketing

Deploy The Content Creator Agent to develop content strategies and create tailored content for different audience segments.

### 5. AI Prompt Generation

Use The Prompt Wizard Agent to create high-impact AI prompts for Lead Recon Pro prospecting and analysis.

### 6. Business Intelligence

Combine all agents for comprehensive business intelligence and lead generation automation.

## 🔄 Workflow Examples

### Complete Lead Recon Workflow

1. **Profiler Agent**: Analyze business and create ideal client profiles
2. **Strategist Agent**: Develop marketing strategy based on client profiles
3. **DM Breakthrough Agent**: Create messaging strategies for identified prospects
4. **Content Creator Agent**: Develop content strategy and pieces for engagement
5. **Prompt Wizard Agent**: Generate AI prompts for Lead Recon Pro prospecting

### Individual Agent Usage

Each agent can be used independently for specific business intelligence needs:

- **Profiler**: For client research and persona development
- **Strategist**: For marketing strategy and planning
- **DM Breakthrough**: For prospect outreach and messaging
- **Content Creator**: For content strategy and creation
- **Prompt Wizard**: For AI prompt generation and optimization

## 📊 Performance and Monitoring

### LangSmith Integration

All agents are integrated with LangSmith for performance monitoring and optimization:

- Execution tracking and timing
- Success/failure logging
- Performance metrics collection
- Error handling and reporting

### Analytics and Reporting

Each agent provides comprehensive reporting and analytics:

- Detailed execution reports
- Performance metrics
- Success indicators
- Optimization recommendations

## 🛠️ Configuration

### Environment Variables

Required environment variables for Lead Recon agents:

```bash
# AI Model Configuration
LEAD_RECON_MODEL=gpt-4  # Default model for Lead Recon agents

# LangSmith Integration
LANGCHAIN_API_KEY=your_langsmith_api_key

# Storage Configuration
# (Uses existing PROFILER storage configuration)
```

### Feature Flags

Lead Recon agents respect existing PROFILER feature flags and can be enabled/disabled as needed.

## 🚀 Getting Started

### 1. Prerequisites

- PROFILER system properly configured
- Node.js 22.12.0+
- Required environment variables set
- LangSmith API key configured

### 2. API Testing

Test individual agents using the API endpoints:

```bash
# Test The Profiler Agent
curl -X POST http://localhost:3000/api/lead-recon/profiler \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "test-001",
    "businessName": "Test Business",
    "industry": "Technology",
    "services": ["Consulting", "Development"],
    "valueProposition": "We help businesses grow"
  }'
```

### 3. Integration Testing

Test the complete workflow through the conductor:

```bash
# Run complete PROFILER workflow with Lead Recon agents
npm run dev
```

## 📈 Success Metrics

### The Profiler Agent

- Profile accuracy and completeness
- Strategic question relevance
- Client persona quality
- Business analysis depth

### The Strategist Agent

- Marketing strategy comprehensiveness
- Connection strategy effectiveness
- Channel strategy alignment
- Implementation roadmap clarity

### DM Message Breakthrough Agent

- Message template effectiveness
- Attention hook performance
- Follow-up sequence engagement
- Prospect response rates

### The Content Creator Agent

- Content strategy alignment
- Content piece quality
- Distribution strategy effectiveness
- Audience engagement metrics

### The Prompt Wizard Agent

- Prompt effectiveness and clarity
- Variable usage relevance
- Prompt performance and execution
- User satisfaction and adoption

## 🔧 Troubleshooting

### Common Issues

1. **Agent Execution Failures**: Check LangSmith configuration and API keys
2. **Missing Artifacts**: Verify packet data completeness
3. **Performance Issues**: Monitor LangSmith metrics and optimize prompts
4. **Integration Errors**: Check conductor configuration and agent imports

### Debug Mode

Enable debug mode for detailed logging:

```bash
DEBUG=profiler:lead-recon npm run dev
```

## 📚 Additional Resources

- [PROFILER System Documentation](./README.md)
- [API Documentation](./API.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [LangSmith Integration](./LANGSMITH.md)

## 🤝 Support

For support with Lead Recon agents:

1. Check the troubleshooting section
2. Review LangSmith logs for execution details
3. Verify configuration and environment variables
4. Contact the development team for advanced issues

---

**Note**: The Lead Recon agents are designed to work seamlessly with the existing PROFILER system while providing advanced business intelligence capabilities. They can be used individually or as part of the complete workflow for comprehensive lead generation and client engagement automation.
