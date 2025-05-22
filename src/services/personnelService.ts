
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/types/supabase";

type StaffMember = Database["public"]["Tables"]["staff"]["Row"];

export const personnelService = {
  async addPersonnel(personnelData: {
    email: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    role: string;
    shop_id: string;
  }) {
    try {
      const { data, error } = await supabase
        .from("staff")
        .insert({
          email: personnelData.email,
          first_name: personnelData.first_name,
          last_name: personnelData.last_name,
          phone: personnelData.phone,
          role: personnelData.role,
          shop_id: personnelData.shop_id,
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error adding personnel:", error);
      return { data: null, error };
    }
  },
  
  async invitePersonnel(email: string) {
    try {
      // Use Supabase auth.invite_user_by_email()
      const { error } = await supabase.auth.admin.inviteUserByEmail(email);
      
      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Error inviting personnel:", error);
      return { success: false, error };
    }
  }
};
