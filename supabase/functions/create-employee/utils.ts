
// CORS headers for all responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

// Create a response with proper CORS headers
export function createResponse(body: any, status = 200) {
  return new Response(
    JSON.stringify(body),
    { headers: {...corsHeaders, 'Content-Type': 'application/json'}, status }
  )
}
