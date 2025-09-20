# ClickUp ABM Task Templates

## Core 5-Touch Play Template

### Task Details

- **Name**: `ABM Core 5-Touch: {{account_name}}`
- **Description**:

```
Account: {{account_name}}
Industry: {{industry}}
Stage: {{abm_stage}}
ICP Score: {{icp_score}}
Intent Score: {{intent_score}}

## Core 5-Touch Play Sequence

### Day 0: Account Brief Email
- [ ] Send personalized account brief email
- [ ] Include region-specific market analysis
- [ ] Propose 14-day pilot scope
- [ ] Track email open/click rates

### Day 2: LinkedIn Outreach
- [ ] Connect with Champion contact on LinkedIn
- [ ] Send personalized connection request
- [ ] Follow up with value-add message
- [ ] Log engagement metrics

### Day 5: Value Video
- [ ] Send value proposition video
- [ ] Include case study relevant to their industry
- [ ] Highlight ROI potential
- [ ] Schedule follow-up call

### Day 8: Physical 1-Pager
- [ ] Send physical account briefing
- [ ] Include QR code for tracking
- [ ] Personalized market gap analysis
- [ ] Follow up on delivery

### Day 12: Executive Email
- [ ] Send ROI-focused executive email
- [ ] Include pilot success metrics
- [ ] Propose working session
- [ ] Set clear next steps

## Success Metrics
- [ ] Email engagement > 40%
- [ ] LinkedIn connection accepted
- [ ] Meeting booked within 14 days
- [ ] Intent score increase > 20 points
```

- **Priority**: High
- **Status**: Not Started
- **Assignee**: {{marketing_owner}}
- **Due Date**: {{start_date + 14 days}}
- **Custom Fields**:
  - `Account ID`: {{account_id}}
  - `ABM Stage`: {{abm_stage}}
  - `ICP Score`: {{icp_score}}
  - `Intent Score`: {{intent_score}}
  - `Industry`: {{industry}}

### Subtasks

1. **Day 0: Account Brief Email** (Due: {{start_date}})
2. **Day 2: LinkedIn Outreach** (Due: {{start_date + 2 days}})
3. **Day 5: Value Video** (Due: {{start_date + 5 days}})
4. **Day 8: Physical 1-Pager** (Due: {{start_date + 8 days}})
5. **Day 12: Executive Email** (Due: {{start_date + 12 days}})
6. **Follow-up & Metrics** (Due: {{start_date + 14 days}})

## Pilot Launch Template

### Task Details

- **Name**: `ABM Pilot Launch: {{account_name}}`
- **Description**:

```
Account: {{account_name}}
Pilot Duration: 14 days
Start Date: {{pilot_start_date}}
Expected ROI: {{expected_roi}}

## Pilot Scope
- Markets: {{markets}}
- Service Lines: {{service_lines}}
- SLA: <5 minutes first response
- Routing Rules: By LOA/segment

## Success Criteria
- [ ] >10 qualified meetings booked
- [ ] >60% lead qualification rate
- [ ] >$50k pipeline influenced
- [ ] Account expansion opportunity identified

## Pilot Activities
- [ ] Set up branded lead funnel
- [ ] Configure routing rules
- [ ] Launch microsite
- [ ] Daily intent monitoring
- [ ] Weekly success reviews
- [ ] Expansion planning

## Post-Pilot Actions
- [ ] Analyze pilot results
- [ ] Present ROI to stakeholders
- [ ] Propose expansion terms
- [ ] Negotiate contract
```

- **Priority**: High
- **Status**: Not Started
- **Assignee**: {{sales_owner}}
- **Due Date**: {{pilot_start_date + 14 days}}
- **Custom Fields**:
  - `Account ID`: {{account_id}}
  - `Pilot Type`: Managed ABM
  - `Expected Value`: {{expected_value}}
  - `Success Metrics`: {{success_metrics}}

### Subtasks

1. **Pilot Setup** (Due: {{pilot_start_date - 3 days}})
2. **Launch & Monitor** (Due: {{pilot_start_date}})
3. **Weekly Reviews** (Due: {{pilot_start_date + 7 days}})
4. **Results Analysis** (Due: {{pilot_start_date + 14 days}})
5. **Expansion Proposal** (Due: {{pilot_start_date + 16 days}})

## ClickUp Space Structure

### Spaces

- **ABM - Luxury Yachts**
  - **Lists**:
    - Active Campaigns
    - Pilot Launches
    - Intent Monitoring
    - Expansion Opportunities
    - Completed Campaigns

### Custom Fields

- `Account ID` (Text)
- `ABM Stage` (Dropdown: IDENTIFY, ENGAGE, ACTIVATE, CLOSE, EXPAND)
- `ICP Score` (Number)
- `Intent Score` (Number)
- `Industry` (Text)
- `Expected Value` (Currency)
- `Success Metrics` (Text)

### Automation Rules

1. **Auto-assign tasks** based on account tier
2. **Update custom fields** when ABM stage changes
3. **Create follow-up tasks** when pilot completes
4. **Escalate overdue tasks** to managers
5. **Archive completed campaigns** after 30 days

## Integration with n8n

### Webhook Endpoints

- `https://your-n8n.com/webhook/clickup-abm-stage-change`
- `https://your-n8n.com/webhook/clickup-task-completed`
- `https://your-n8n.com/webhook/clickup-pilot-launched`

### Event Types

- `task_created` - New ABM task created
- `task_completed` - ABM task marked complete
- `stage_advanced` - Account stage changed
- `pilot_launched` - Pilot campaign started
- `expansion_proposed` - Expansion opportunity identified
