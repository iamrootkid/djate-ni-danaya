
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Customer = Database["public"]["Tables"]["customers"]["Row"];
type CustomerInsert = Database["public"]["Tables"]["customers"]["Insert"];

export const fetchCustomers = async (shopId: string): Promise<Customer[]> => {
  if (!shopId) {
    console.warn("No shop ID provided for fetching customers");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("shop_id", shopId)
      .order("first_name");

    if (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchCustomers:", error);
    return [];
  }
};

export const createCustomer = async (
  customerData: Omit<CustomerInsert, "shop_id">,
  shopId: string
): Promise<Customer> => {
  if (!shopId) {
    throw new Error("Shop ID is required for creating a customer");
  }

  try {
    const { data, error } = await supabase
      .from("customers")
      .insert([{ ...customerData, shop_id: shopId }])
      .select()
      .single();

    if (error) {
      console.error("Error creating customer:", error);
      throw error;
    }

    if (!data) {
      throw new Error("No data returned from customer creation");
    }

    return data;
  } catch (error) {
    console.error("Error in createCustomer:", error);
    throw error;
  }
};

export const updateCustomer = async (
  customerId: string,
  customerData: Partial<Omit<CustomerInsert, "shop_id">>,
  shopId: string
): Promise<Customer> => {
  if (!shopId) {
    throw new Error("Shop ID is required for updating a customer");
  }

  try {
    const { data, error } = await supabase
      .from("customers")
      .update(customerData)
      .eq("id", customerId)
      .eq("shop_id", shopId)
      .select()
      .single();

    if (error) {
      console.error("Error updating customer:", error);
      throw error;
    }

    if (!data) {
      throw new Error("No data returned from customer update");
    }

    return data;
  } catch (error) {
    console.error("Error in updateCustomer:", error);
    throw error;
  }
};

export const deleteCustomer = async (customerId: string, shopId: string): Promise<void> => {
  if (!shopId) {
    throw new Error("Shop ID is required for deleting a customer");
  }

  try {
    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", customerId)
      .eq("shop_id", shopId);

    if (error) {
      console.error("Error deleting customer:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in deleteCustomer:", error);
    throw error;
  }
};
