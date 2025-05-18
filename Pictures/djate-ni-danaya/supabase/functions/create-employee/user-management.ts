
// Create auth user
export async function createAuthUser(supabase: any, userData: any) {
  const { email, password, firstName, lastName, role, shopId } = userData
  
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      role: role,
      shop_id: shopId
    }
  })

  if (authError) {
    console.error('Error creating auth user:', authError)
    return {
      success: false,
      error: authError.message
    }
  }

  console.log('Auth user created successfully:', authUser.user.id)
  return {
    success: true,
    userId: authUser.user.id
  }
}

// Create staff record
export async function createStaffRecord(supabase: any, userData: any, userId: string) {
  const { firstName, lastName, email, role, phone, shopId } = userData
  
  // Check if staff record already exists
  const { data: existingStaff } = await supabase
    .from('staff')
    .select('id')
    .eq('id', userId)
    .single()
    
  if (existingStaff) {
    console.log('Staff record already exists for user:', userId)
    return { success: true }
  }
  
  // Remove the status field which doesn't exist in the staff table
  const { error: staffError } = await supabase
    .from('staff')
    .insert({
      id: userId,
      first_name: firstName,
      last_name: lastName,
      email,
      role,
      phone,
      shop_id: shopId
    })

  if (staffError) {
    console.error('Error creating staff record:', staffError)
    return {
      success: false,
      error: staffError.message
    }
  }

  console.log('Staff record created successfully')
  return { success: true }
}

// Create or update profile
export async function createOrUpdateProfile(supabase: any, userData: any, userId: string) {
  const { email, role, shopId, firstName, lastName } = userData
  
  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()

  if (!existingProfile) {
    // Create profile record
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        role,
        shop_id: shopId,
        first_name: firstName,
        last_name: lastName
      })

    if (profileError) {
      console.error('Error creating profile record:', profileError)
      return {
        success: false,
        error: profileError.message
      }
    }

    console.log('Profile record created successfully')
  } else {
    // Update existing profile
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ 
        role,
        shop_id: shopId 
      })
      .eq('id', userId)
    
    if (updateProfileError) {
      console.error('Error updating profile role:', updateProfileError)
      return {
        success: false,
        error: updateProfileError.message
      }
    }

    console.log('Profile role and shop_id updated successfully')
  }

  return { success: true }
}

// Clean up on failure
export async function cleanupOnFailure(supabase: any, userId: string) {
  await supabase.auth.admin.deleteUser(userId)
  await supabase.from('staff').delete().eq('id', userId)
  console.log('Clean up completed for user:', userId)
}
