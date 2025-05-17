
import { supabase } from "@/integrations/supabase/client";
import type { Customer } from "@/types/customer";

// Fetch all customers for current shop
export async function getCustomers(shop_id: string): Promise<Customer[]> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("shop_id", shop_id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Customer[];
}

// Add a customer
export async function addCustomer(values: Partial<Customer> & { shop_id: string }) {
  const { data, error } = await supabase
    .from("customers")
    .insert([values])
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as Customer;
}

// Update a customer
export async function updateCustomer(id: string, values: Partial<Customer>) {
  const { data, error } = await supabase
    .from("customers")
    .update(values)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as Customer;
}

// Delete a customer
export async function deleteCustomer(id: string) {
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw error;
}
