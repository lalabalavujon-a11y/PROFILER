# 🚀 PROFILER Cloudflare Pages Deployment Guide

## ✅ Pre-Deployment Checklist
- [x] GitHub repository: https://github.com/lalabalavujon-a11y/PROFILER
- [x] Built files in dist/ directory
- [x] Cloudflare Pages Functions created
- [x] Environment configuration ready
- [x] API routing configured

## 🌐 Cloudflare Pages Setup Steps

### 1. Access Cloudflare Dashboard
Go to: https://dash.cloudflare.com
- Click "Workers & Pages" in sidebar
- Click "Create Application"
- Select "Pages" tab
- Click "Connect to Git"

### 2. GitHub Integration
- Select "GitHub" as Git provider
- Authorize Cloudflare access
- Choose repository: `lalabalavujon-a11y/PROFILER`
- Click "Begin setup"

### 3. Build Configuration
```
Project name: profiler-lead-recon
Production branch: main
Framework preset: None
Build command: (leave empty)
Build output directory: dist
Root directory: (leave empty)
```

### 4. Environment Variables
Add these in the Environment Variables section:

**Required:**
- NODE_ENV = production
- PORT = 8080
- GAMMA_ENABLED = true
- DEFAULT_DECK_PROVIDER = gamma
- ENABLE_MCP_RUBE = true

**API Keys (add your values):**
- OPENAI_API_KEY = [your-key]
- SUPABASE_URL = [your-url]
- SUPABASE_ANON_KEY = [your-key]
- GAMMA_API_KEY = [your-key]
- LANGCHAIN_API_KEY = [your-key]

### 5. Deploy
- Click "Save and Deploy"
- Wait 2-3 minutes for deployment
- Verify deployment success

### 6. Custom Domain
- Go to "Custom domains" tab
- Add domain: profiler.leadrecon.app
- Configure DNS as instructed
- Wait for SSL certificate (automatic)

## 🧪 Post-Deployment Testing

Test these endpoints after deployment:
- GET https://profiler.leadrecon.app/health
- GET https://profiler.leadrecon.app/api/status
- POST https://profiler.leadrecon.app/api/run-event

## 🎯 Expected Results

✅ Production URL: https://profiler.leadrecon.app
✅ Global CDN: 275+ edge locations
✅ Auto-scaling: Unlimited capacity
✅ SSL Security: Enterprise certificates
✅ Monaco Demo Ready: $25M+ deal presentations

## 🏆 Success Metrics

- Response time: <100ms globally
- Uptime: 99.99% SLA
- Scalability: Handles unlimited demo traffic
- Security: DDoS protection, WAF, SSL
