
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Initialize Supabase client
export function initSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables')
    throw new Error('Missing environment variables')
  }

  return createClient(supabaseUrl, supabaseKey)
}

// Validate request data
export function validateRequestData(data: any) {
  const { email, password, firstName, lastName, role, shopId, isPredefinedUser } = data
  
  // Skip validation for predefined users
  if (isPredefinedUser) {
    return { isValid: true }
  }

  if (!email || !password || !firstName || !lastName) {
    console.error('Missing required fields:', { email, firstName, lastName })
    return {
      isValid: false,
      error: 'Missing required fields'
    }
  }

  if (role !== 'admin' && role !== 'employee') {
    console.error('Invalid role specified:', role)
    return {
      isValid: false,
      error: 'Invalid role. Role must be either "admin" or "employee"'
    }
  }

  if (!shopId) {
    console.error('Shop ID is required')
    return {
      isValid: false,
      error: 'Shop ID is required'
    }
  }

  return { isValid: true }
}

// Verify shop exists
export async function verifyShopExists(supabase: any, shopId: string) {
  if (!shopId) {
    return {
      exists: false,
      error: 'Shop ID is missing'
    }
  }

  const { data: shopData, error: shopError } = await supabase
    .from('shops')
    .select('id')
    .eq('id', shopId)
    .single()

  if (shopError || !shopData) {
    console.error('Shop not found:', shopId)
    return {
      exists: false,
      error: 'Shop not found. Please verify the shop ID.'
    }
  }

  return { exists: true }
}

// Check if email already exists
export async function checkEmailExists(supabase: any, email: string) {
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const emailExists = existingUsers.users.some(user => user.email === email)
  
  if (emailExists) {
    console.log('Email already exists in auth.users:', email)
    // For predefined users, we'll return a success response instead of an error
    return {
      exists: true,
      error: 'A user with this email address has already been registered'
    }
  }

  return { exists: false }
}

// Find user by email
export async function findUserByEmail(supabase: any, email: string) {
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  return existingUsers.users.find(user => user.email === email)
}
