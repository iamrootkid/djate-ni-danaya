
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const createSuperAdmin = async () => {
  try {
    console.log("Creating super admin user...");
    
    // Create super admin user via edge function
    const { data, error } = await supabase.functions.invoke('create-employee', {
      body: {
        email: "superadmin@example.com",
        password: "superadmin123",
        firstName: "Super",
        lastName: "Admin",
        phone: "+1234567890",
        role: "super_admin",
        shopId: null, // Super admin n'est pas lié à un magasin spécifique
        isPredefinedUser: true
      },
      method: 'POST'
    });

    if (error) {
      if (error.message.includes("already been registered")) {
        console.log("Super admin user already exists");
        toast.success("Super admin déjà créé");
        return {
          email: "superadmin@example.com",
          password: "superadmin123"
        };
      } else {
        console.error("Error creating super admin:", error);
        throw new Error(error.message || "Failed to create super admin user");
      }
    }

    toast.success("Super admin créé avec succès");
    
    return {
      email: "superadmin@example.com",
      password: "superadmin123"
    };
  } catch (error: any) {
    console.error("Error creating super admin:", error);
    toast.error(error.message || "Failed to create super admin user");
    throw error;
  }
};
