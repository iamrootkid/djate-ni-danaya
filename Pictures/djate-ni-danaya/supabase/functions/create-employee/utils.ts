// CORS headers for all responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400'
}

// Create a response with proper CORS headers
export function createResponse(body: any, status = 200) {
  return new Response(
    JSON.stringify(body),
    { 
      headers: {
        ...corsHeaders, 
        'Content-Type': 'application/json'
      }, 
      status 
    }
  )
}
