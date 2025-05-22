
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Customer } from "@/types/customer";

// Pulled from generated types for Supabase structure
type DBCustomer = Database['public']['Tables']['customers']['Row'];
type InsertCustomer = Database['public']['Tables']['customers']['Insert'];
type UpdateCustomer = Database['public']['Tables']['customers']['Update'];

// Fetch all customers for current shop
export async function getCustomers(shop_id: string): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('shop_id', shop_id)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  // data is DBCustomer[]
  return (data as DBCustomer[]).map((row) => ({
    id: row.id,
    shop_id: row.shop_id,
    first_name: row.first_name ?? null,
    last_name: row.last_name ?? null,
    email: row.email ?? null,
    phone: row.phone ?? null,
    loyalty_points: row.loyalty_points ?? 0,
    created_at: row.created_at ? String(row.created_at) : "",
    updated_at: row.updated_at ? String(row.updated_at) : "",
  })) as Customer[];
}

// Add a customer
export async function addCustomer(
  values: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>> & { shop_id: string }
) {
  const insertObj: InsertCustomer = {
    first_name: values.first_name ?? null,
    last_name: values.last_name ?? null,
    email: values.email ?? null,
    phone: values.phone ?? null,
    loyalty_points: values.loyalty_points ?? 0,
    shop_id: values.shop_id,
  };
  const { data, error } = await supabase
    .from('customers')
    .insert([insertObj])
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Insertion failed - no data returned");
  // data is DBCustomer
  return {
    id: data.id,
    shop_id: data.shop_id,
    first_name: data.first_name ?? null,
    last_name: data.last_name ?? null,
    email: data.email ?? null,
    phone: data.phone ?? null,
    loyalty_points: data.loyalty_points ?? 0,
    created_at: data.created_at ? String(data.created_at) : "",
    updated_at: data.updated_at ? String(data.updated_at) : "",
  } as Customer;
}

// Update a customer
export async function updateCustomer(
  id: string,
  values: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'shop_id'>>
) {
  const updObj: UpdateCustomer = {
    first_name: values.first_name,
    last_name: values.last_name,
    email: values.email,
    phone: values.phone,
    loyalty_points: values.loyalty_points,
  };
  const { data, error } = await supabase
    .from('customers')
    .update(updObj)
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Update failed - no data returned");
  // data is DBCustomer
  return {
    id: data.id,
    shop_id: data.shop_id,
    first_name: data.first_name ?? null,
    last_name: data.last_name ?? null,
    email: data.email ?? null,
    phone: data.phone ?? null,
    loyalty_points: data.loyalty_points ?? 0,
    created_at: data.created_at ? String(data.created_at) : "",
    updated_at: data.updated_at ? String(data.updated_at) : "",
  } as Customer;
}

// Delete a customer
export async function deleteCustomer(id: string) {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
