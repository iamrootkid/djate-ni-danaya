import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, first_name, last_name, phone, role, shop_id } = body;

    // Generate a UUID for the new user
    const uuid = crypto.randomUUID();

    // Create user in Supabase Auth using the management API
    const authResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify({
        email,
        email_confirm: true,
        user_metadata: {
          first_name,
          last_name,
          role,
          shop_id,
        },
      }),
    });

    if (!authResponse.ok) {
      const error = await authResponse.json();
      throw new Error(error.message || 'Failed to create user');
    }

    const authData = await authResponse.json();

    // Create profile using direct REST API call
    const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        id: authData.id,
        email,
        first_name,
        last_name,
        role,
        shop_id
      })
    });

    if (!profileResponse.ok) {
      const error = await profileResponse.json();
      throw new Error(error.message || 'Failed to create profile');
    }

    // Create staff record using direct REST API call
    const staffResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/staff`, {
      method: 'POST',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        id: authData.id,
        email,
        first_name,
        last_name,
        phone: phone || null,
        role,
        shop_id
      })
    });

    if (!staffResponse.ok) {
      const error = await staffResponse.json();
      throw new Error(error.message || 'Failed to create staff record');
    }

    return NextResponse.json({ 
      success: true,
      message: "Personnel added successfully. An invitation email will be sent shortly."
    });
  } catch (error) {
    console.error("Error creating personnel:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create personnel" },
      { status: 500 }
    );
  }
} 