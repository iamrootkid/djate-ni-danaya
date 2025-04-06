
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const createPredefinedUsers = async () => {
  try {
    console.log("Starting to create predefined users");
    
    // First, create a shop with a new UUID
    console.log("Creating a new demo shop");
    const { data: newShop, error: createShopError } = await supabase
      .from('shops')
      .insert({
        name: 'Demo Shop',
        address: '123 Demo Street'
      })
      .select('id, name')
      .single();
    
    if (createShopError) {
      console.error("Error creating shop:", createShopError);
      throw new Error(`Failed to create demo shop: ${createShopError.message}`);
    }
    
    if (!newShop) {
      throw new Error("Failed to create demo shop: No data returned");
    }
    
    const shopId = newShop.id;
    console.log("Created demo shop with ID:", shopId, "Name:", newShop.name);
    
    // Create an admin user
    console.log("Creating admin user for shop:", shopId);
    const adminResponse = await supabase.functions.invoke('create-employee', {
      body: {
        email: "admin@example.com",
        password: "admin123",
        firstName: "Admin",
        lastName: "User",
        phone: "+1234567890",
        role: "admin",
        shopId: shopId,
        isPredefinedUser: true
      },
      method: 'POST'
    });

    if (adminResponse.error) {
      // If the error is because the user already exists, we can continue
      if (adminResponse.error.message.includes("already been registered")) {
        console.log("Admin user already exists, continuing...");
      } else {
        console.error("Error creating admin user:", adminResponse.error);
        throw new Error(adminResponse.error.message || "Failed to create admin user");
      }
    }

    // Create an employee user
    console.log("Creating employee user for shop:", shopId);
    const employeeResponse = await supabase.functions.invoke('create-employee', {
      body: {
        email: "employee@example.com",
        password: "employee123",
        firstName: "Employee",
        lastName: "User",
        phone: "+1987654321",
        role: "employee",
        shopId: shopId,
        isPredefinedUser: true
      },
      method: 'POST'
    });

    if (employeeResponse.error) {
      // If the error is because the user already exists, we can continue
      if (employeeResponse.error.message.includes("already been registered")) {
        console.log("Employee user already exists, continuing...");
      } else {
        console.error("Error creating employee user:", employeeResponse.error);
        throw new Error(employeeResponse.error.message || "Failed to create employee user");
      }
    }

    // Store the shop ID in localStorage for immediate use
    console.log("Storing shop ID in localStorage:", shopId);
    localStorage.setItem('shopId', shopId);

    toast.success("Predefined users created successfully");
    
    return {
      admin: {
        email: "admin@example.com",
        password: "admin123"
      },
      employee: {
        email: "employee@example.com",
        password: "employee123"
      },
      shopId: shopId
    };
  } catch (error: any) {
    console.error("Error creating predefined users:", error);
    toast.error(error.message || "Failed to create predefined users");
    throw error;
  }
};
