
import { supabase } from "@/integrations/supabase/client";

export interface Customer {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  shop_id: string;
  loyalty_points: number;
  created_at: string;
  updated_at: string;
}

export const getCustomers = async (shopId: string): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }

  return data || [];
};

export const createCustomer = async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>, shopId: string): Promise<Customer> => {
  const customerData = {
    ...customer,
    shop_id: shopId,
  };

  const { data, error } = await supabase
    .from('customers')
    .insert([customerData])
    .select()
    .single();

  if (error) {
    console.error('Error creating customer:', error);
    throw error;
  }

  return data;
};

export const updateCustomer = async (id: string, customer: Partial<Omit<Customer, 'shop_id'>>, shopId: string): Promise<Customer> => {
  const { data, error } = await supabase
    .from('customers')
    .update(customer)
    .eq('id', id)
    .eq('shop_id', shopId)
    .select()
    .single();

  if (error) {
    console.error('Error updating customer:', error);
    throw error;
  }

  return data;
};

export const deleteCustomer = async (id: string, shopId: string): Promise<void> => {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)
    .eq('shop_id', shopId);

  if (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};
