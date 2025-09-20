// Minimal Cloudflare Pages Function for PROFILER
export async function onRequest(context) {
  return new Response('PROFILER API Functions are working!', {
    headers: { 
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
