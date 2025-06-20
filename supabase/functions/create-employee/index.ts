import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { corsHeaders, createResponse } from "./utils.ts"
import { 
  initSupabaseClient, 
  validateRequestData, 
  verifyShopExists, 
  checkEmailExists, 
  findUserByEmail 
} from "./validation.ts"
import { 
  createAuthUser, 
  createStaffRecord, 
  createOrUpdateProfile, 
  cleanupOnFailure 
} from "./user-management.ts"
import type { 
  ValidationResult, 
  ShopVerificationResult, 
  EmailCheckResult, 
  AuthUserResult, 
  StaffResult, 
  ProfileResult, 
  ExistingUser,
  RequestBody 
} from "./types.ts"

// Main handler function
serve(async (req) => {
  console.log('Create employee function invoked:', req.method)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: {
        ...corsHeaders,
        'Access-Control-Max-Age': '86400'
      }
    })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return createResponse({ 
      error: 'Method not allowed',
      details: 'Only POST requests are accepted'
    }, 405)
  }

  let supabase;
  try {
    // Initialize Supabase client
    supabase = initSupabaseClient()
    
    // Parse and validate content type
    const contentType = req.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return createResponse({ 
        error: 'Invalid content type',
        details: 'Content-Type must be application/json'
      }, 400)
    }

    // Parse request body with better error handling
    let requestBody: RequestBody
    try {
      requestBody = await req.json()
    } catch (error) {
      console.error('Error parsing request body:', error)
      return createResponse({ 
        error: 'Invalid request body',
        details: 'Request body must be valid JSON'
      }, 400)
    }

    // Validate required fields
    const { email, password, firstName, lastName, phone, role, shopId, isPredefinedUser = false } = requestBody
    
    if (!email || !firstName || !lastName || !role || !shopId) {
      return createResponse({ 
        error: 'Missing required fields',
        details: 'Email, firstName, lastName, role, and shopId are required'
      }, 400)
    }

    console.log('Processing request for email:', email)

    // Validate request data
    const validation = await validateRequestData(requestBody) as ValidationResult
    if (!validation.isValid) {
      return createResponse({ 
        error: 'Validation failed',
        details: validation.error 
      }, 400)
    }

    // Verify shop exists
    const shopVerification = await verifyShopExists(supabase, shopId) as ShopVerificationResult
    if (!shopVerification.exists) {
      return createResponse({ 
        error: 'Invalid shop',
        details: shopVerification.error 
      }, 400)
    }

    // Check for existing user
    const existingUser = await findUserByEmail(supabase, email)
    if (existingUser && !isPredefinedUser) {
      return createResponse({ 
        error: 'User exists',
        details: 'A user with this email already exists'
      }, 409)
    }

    console.log('Creating employee with data:', { 
      email, 
      firstName, 
      lastName, 
      role, 
      shopId,
      phone: phone || 'Not provided'
    })

    // Start transaction-like operations
    let userId: string | null = null;
    
    try {
      // Create auth user
      const authUserResult = await createAuthUser(supabase, requestBody) as AuthUserResult
      if (!authUserResult.success) {
        throw new Error(authUserResult.error)
      }
      userId = authUserResult.userId!

      // Create staff record
      const staffResult = await createStaffRecord(supabase, requestBody, userId) as StaffResult
      if (!staffResult.success) {
        throw new Error(staffResult.error)
      }

      // Create or update profile
      const profileResult = await createOrUpdateProfile(supabase, requestBody, userId) as ProfileResult
      if (!profileResult.success) {
        throw new Error(profileResult.error)
      }

      // Success response
      return createResponse({ 
        message: `Employee created successfully with role: ${role}`,
        data: {
          userId,
          email,
          role,
          shopId,
          firstName,
          lastName
        }
      }, 201)

    } catch (error) {
      // If any step fails, cleanup and return error
      if (userId) {
        await cleanupOnFailure(supabase, userId)
      }
      return createResponse({ 
        error: 'Failed to create employee',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      }, 400)
    }

  } catch (error) {
    console.error('Unexpected error:', error)
    return createResponse({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, 500)
  }
})
