import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { RequestCookies } from 'next/dist/server/web/spec-extension/cookies';

export async function POST(request: Request) {
  try {
    console.log("Starting personnel creation process...");
    
    const cookieStore = cookies() as unknown as RequestCookies;
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              console.error("Cookie setting error:", error);
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: "", ...options });
            } catch (error) {
              console.error("Cookie removal error:", error);
            }
          },
        },
      }
    );

    const body = await request.json();
    console.log("Received request body:", body);
    
    const { email, first_name, last_name, phone, role, shop_id } = body;

    if (!email || !first_name || !last_name || !role || !shop_id) {
      console.log("Missing required fields:", { email, first_name, last_name, role, shop_id });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists in staff table
    console.log("Checking for existing staff member...");
    const { data: existingStaff, error: checkError } = await supabase
      .from("staff")
      .select("id")
      .eq("email", email)
      .eq("shop_id", shop_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error("Error checking existing staff:", checkError);
      return NextResponse.json(
        { error: "Error checking existing staff" },
        { status: 500 }
      );
    }

    if (existingStaff) {
      console.log("Staff member already exists:", existingStaff);
      return NextResponse.json(
        { error: "User with this email already exists in this shop" },
        { status: 400 }
      );
    }

    // Generate a UUID for the new staff member
    const staffId = crypto.randomUUID();
    console.log("Generated staff ID:", staffId);

    // Create staff record first
    console.log("Creating staff record...");
    const { data: staffData, error: staffError } = await supabase
      .from("staff")
      .insert({
        id: staffId,
        email,
        first_name,
        last_name,
        phone: phone || null,
        role,
        shop_id,
      })
      .select()
      .single();

    if (staffError) {
      console.error("Staff creation error:", staffError);
      return NextResponse.json(
        { error: staffError.message || "Failed to create staff record" },
        { status: 500 }
      );
    }

    console.log("Staff record created successfully:", staffData);

    // Create profile record
    console.log("Creating profile record...");
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: staffId,
        email,
        first_name,
        last_name,
        role,
        shop_id,
      })
      .select()
      .single();

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Cleanup staff record if profile creation fails
      console.log("Cleaning up staff record...");
      const { error: cleanupError } = await supabase
        .from("staff")
        .delete()
        .eq("id", staffId);
      
      if (cleanupError) {
        console.error("Cleanup error:", cleanupError);
      }
      
      return NextResponse.json(
        { error: profileError.message || "Failed to create user profile" },
        { status: 500 }
      );
    }

    console.log("Profile record created successfully:", profileData);

    return NextResponse.json({
      success: true,
      message: "Personnel added successfully",
      staff: staffData,
      profile: profileData
    });
  } catch (error) {
    console.error("Unexpected error in personnel creation:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create personnel" },
      { status: 500 }
    );
  }
} 