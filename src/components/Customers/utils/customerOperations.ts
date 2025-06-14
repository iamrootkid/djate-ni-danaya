
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

  return (data || []) as Customer[];
};

export const createCustomer = async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>, shopId: string): Promise<Customer> => {
  const customerData = {
    first_name: customer.first_name,
    last_name: customer.last_name,
    email: customer.email,
    phone: customer.phone,
    loyalty_points: customer.loyalty_points || 0,
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

  return data as Customer;
};

export const updateCustomer = async (id: string, customer: Partial<Omit<Customer, 'id' | 'shop_id' | 'created_at' | 'updated_at'>>, shopId: string): Promise<Customer> => {
  const updateData = {
    ...(customer.first_name !== undefined && { first_name: customer.first_name }),
    ...(customer.last_name !== undefined && { last_name: customer.last_name }),
    ...(customer.email !== undefined && { email: customer.email }),
    ...(customer.phone !== undefined && { phone: customer.phone }),
    ...(customer.loyalty_points !== undefined && { loyalty_points: customer.loyalty_points }),
  };

  const { data, error } = await supabase
    .from('customers')
    .update(updateData)
    .eq('id', id)
    .eq('shop_id', shopId)
    .select()
    .single();

  if (error) {
    console.error('Error updating customer:', error);
    throw error;
  }

  return data as Customer;
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

// Add alias for backward compatibility
export const addCustomer = createCustomer;
