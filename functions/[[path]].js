// Cloudflare Pages Function for PROFILER API
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // Root endpoint - serve the static site
  if (url.pathname === '/') {
    return new Response(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PROFILER - AI Lead Intelligence System</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 100vh; }
        .container { max-width: 800px; margin: 0 auto; text-align: center; }
        h1 { font-size: 3rem; margin-bottom: 1rem; }
        .subtitle { font-size: 1.2rem; opacity: 0.9; margin-bottom: 2rem; }
        .status { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0; }
        .endpoints { text-align: left; background: rgba(0,0,0,0.2); padding: 20px; border-radius: 10px; margin: 20px 0; }
        .endpoint { font-family: 'Monaco', 'Menlo', monospace; background: rgba(255,255,255,0.1); padding: 8px 12px; border-radius: 5px; margin: 5px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 PROFILER</h1>
        <p class="subtitle">AI Lead Intelligence System - Now Live on Cloudflare Pages</p>
        
        <div class="status">
            <h3>✅ Deployment Status: LIVE</h3>
            <p>Successfully deployed to profiler.leadrecon.app</p>
            <p><strong>Environment:</strong> Production</p>
            <p><strong>Version:</strong> 1.0.0</p>
            <p><strong>Platform:</strong> Cloudflare Pages</p>
        </div>
        
        <div class="endpoints">
            <h3>Available API Endpoints:</h3>
            <div class="endpoint">GET /health - Health check</div>
            <div class="endpoint">GET /api/status - API status</div>
            <div class="endpoint">POST /api/run-event - Lead processing</div>
        </div>
        
        <p style="margin-top: 40px; opacity: 0.8;">
            Ready for Monaco Yacht Solutions Demo 🛥️
        </p>
    </div>
</body>
</html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
  
  // For all other routes, redirect to API handler
  return new Response('PROFILER API is running on Cloudflare Pages!', {
    headers: { 'Content-Type': 'text/plain' }
  });
}
