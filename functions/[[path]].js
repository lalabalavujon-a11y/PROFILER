// Cloudflare Pages Function for PROFILER - Static File Handler
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Handle API routes
  if (pathname.startsWith('/api/')) {
    return new Response('PROFILER API Functions are working!', {
      headers: { 
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // Handle health check
  if (pathname === '/health') {
    return new Response('PROFILER API Functions are working!', {
      headers: { 
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // For all other routes, let Cloudflare Pages serve static files
  // This allows the static HTML to be served properly
  return context.next();
}
