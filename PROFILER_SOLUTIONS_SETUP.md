# 🚀 PROFILER.SOLUTIONS Domain Setup Guide

**Target Domain**: `profiler.solutions`  
**System**: PROFILER AI Lead Intelligence Platform  
**Deployment**: Cloudflare Pages  

## 📋 Setup Checklist

### 1. Cloudflare Pages Configuration

**In your Cloudflare Dashboard:**

1. Go to **Pages** → Find your `profiler-lead-recon` project
2. Click **Custom domains** → **Set up a custom domain**
3. Enter: `profiler.solutions`
4. Cloudflare will provide DNS instructions

### 2. DNS Configuration

**Add these DNS records to your domain registrar:**

```dns
Type: CNAME
Name: @
Target: [your-pages-project].pages.dev
TTL: Auto (or 300)

Type: CNAME  
Name: www
Target: profiler.solutions
TTL: Auto (or 300)
```

**Alternative (if CNAME @ not supported):**
```dns
Type: A
Name: @
Target: [Cloudflare Pages IP addresses]
TTL: Auto (or 300)
```

### 3. SSL/TLS Configuration

1. In Cloudflare → **SSL/TLS** → **Overview**
2. Set encryption mode to **Full (strict)**
3. Enable **Always Use HTTPS**
4. Enable **Automatic HTTPS Rewrites**

### 4. Performance Optimization

**Recommended Cloudflare Settings:**
- **Speed** → **Optimization** → Enable Auto Minify (HTML, CSS, JS)
- **Caching** → **Configuration** → Browser Cache TTL: 4 hours
- **Speed** → **Optimization** → Enable Rocket Loader
- **Network** → Enable HTTP/3

## 🧪 Testing Endpoints

Once configured, test these endpoints:

```bash
# Health check
curl https://profiler.solutions/health

# API status
curl https://profiler.solutions/api/status

# Lead processing (POST)
curl -X POST https://profiler.solutions/api/run-event \
  -H "Content-Type: application/json" \
  -d '{"packet":{"eventId":"test-123","industry":"luxury-marine"}}'
```

## 🛥️ Monaco Yacht Demo Ready

**Demo URLs:**
- **Landing Page**: https://profiler.solutions
- **API Endpoint**: https://profiler.solutions/api/run-event
- **Health Check**: https://profiler.solutions/health

## 🔧 Troubleshooting

**If site not accessible:**
1. Check DNS propagation: `nslookup profiler.solutions`
2. Verify Cloudflare Pages deployment status
3. Check custom domain configuration in Pages dashboard
4. Ensure SSL certificate is active

**Expected Response Times:**
- **Global**: < 100ms (275+ edge locations)
- **Monaco**: < 50ms (nearby European edge)
- **API Processing**: < 500ms

## 📊 System Status

✅ **Deployment**: Ready  
✅ **Functions**: Configured  
✅ **SSL**: Auto-provisioned  
✅ **Global CDN**: Active  
✅ **Monaco Demo**: Prepared  

---

**Next Steps:** Configure DNS records → Test endpoints → Launch Monaco demo! 🎯
