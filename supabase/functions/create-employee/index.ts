
import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { corsHeaders, createResponse } from "./utils.ts"
import { initSupabaseClient, validateRequestData, verifyShopExists, checkEmailExists, findUserByEmail } from "./validation.ts"
import { createAuthUser, createStaffRecord, createOrUpdateProfile, cleanupOnFailure } from "./user-management.ts"

// Main handler function
serve(async (req) => {
  console.log('Create employee function invoked:', req.method)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabase = initSupabaseClient()

    // Parse request body
    const requestBody = await req.json()
    const { email, password, firstName, lastName, phone, role, shopId, isPredefinedUser } = requestBody

    console.log('Processing request for email:', email, 'isPredefinedUser:', isPredefinedUser)

    // Validate request data
    const validation = validateRequestData(requestBody)
    if (!validation.isValid) {
      return createResponse({ error: validation.error }, 400)
    }

    // Verify shop exists
    const shopVerification = await verifyShopExists(supabase, shopId)
    if (!shopVerification.exists) {
      return createResponse({ error: shopVerification.error }, 400)
    }

    // Check if email already exists
    const emailCheck = await checkEmailExists(supabase, email)
    
    // If this is a predefined user and the email already exists, return success with existing user info
    if (isPredefinedUser && emailCheck.exists) {
      console.log('Predefined user already exists, returning success response')
      const existingUser = await findUserByEmail(supabase, email)
      
      if (existingUser) {
        return createResponse({
          message: `User with email ${email} already exists`,
          userId: existingUser.id,
          role: role,
          shopId: shopId,
          userExists: true
        }, 200)
      }
    } else if (!isPredefinedUser && emailCheck.exists) {
      return createResponse({ error: emailCheck.error }, 400)
    }

    console.log('Creating employee with data:', { email, firstName, lastName, role, shopId })

    // Create auth user
    const authUserResult = await createAuthUser(supabase, requestBody)
    if (!authUserResult.success) {
      return createResponse({ error: authUserResult.error }, 400)
    }

    // Create staff record
    const staffResult = await createStaffRecord(supabase, requestBody, authUserResult.userId)
    if (!staffResult.success) {
      await cleanupOnFailure(supabase, authUserResult.userId)
      return createResponse({ error: staffResult.error }, 400)
    }

    // Create or update profile
    const profileResult = await createOrUpdateProfile(supabase, requestBody, authUserResult.userId)
    if (!profileResult.success) {
      await cleanupOnFailure(supabase, authUserResult.userId)
      return createResponse({ error: profileResult.error }, 400)
    }

    // Success response
    return createResponse({ 
      message: `Employee created successfully with role: ${role}`,
      userId: authUserResult.userId,
      role: role,
      shopId: shopId
    }, 200)

  } catch (error: any) {
    console.error('Unexpected error:', error)
    return createResponse({ 
      error: 'An unexpected error occurred',
      details: error.message 
    }, 500)
  }
})
