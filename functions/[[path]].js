// Cloudflare Pages Function for PROFILER API
export async function onRequest(context) {
  // Import the built server
  const server = await import('../dist/api/simple-server.js');
  
  // Handle the request
  return new Response('PROFILER API is running on Cloudflare Pages!', {
    headers: { 'Content-Type': 'text/plain' }
  });
}
