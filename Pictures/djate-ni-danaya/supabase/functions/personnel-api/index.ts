
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    // Get the request body
    const requestData = await req.json();

    if (path === "invite") {
      // Handle inviting a user 
      const { email } = requestData;
      
      if (!email) {
        return new Response(
          JSON.stringify({ error: "Email is required" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      const { error } = await supabaseClient.auth.admin.inviteUserByEmail(email);
      
      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: "Invitation email sent successfully" 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } else if (path === "create") {
      // Handle creating a new personnel
      const { email, first_name, last_name, phone, role, shop_id } = requestData;

      if (!email || !first_name || !last_name || !role || !shop_id) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      // Check if user already exists in staff table
      const { data: existingStaff, error: checkError } = await supabaseClient
        .from("staff")
        .select("id")
        .eq("email", email)
        .eq("shop_id", shop_id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw checkError;
      }

      if (existingStaff) {
        return new Response(
          JSON.stringify({ error: "User with this email already exists in this shop" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      // Generate a UUID for the new staff member
      const staffId = crypto.randomUUID();

      // Create staff record first
      const { data: staffData, error: staffError } = await supabaseClient
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
        throw staffError;
      }

      // Create profile record
      const { data: profileData, error: profileError } = await supabaseClient
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
        // Cleanup staff record if profile creation fails
        await supabaseClient
          .from("staff")
          .delete()
          .eq("id", staffId);
          
        throw profileError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Personnel added successfully",
          staff: staffData,
          profile: profileData
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid endpoint" }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in personnel API:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
