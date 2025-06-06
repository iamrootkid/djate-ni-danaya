
import { supabase } from "@/integrations/supabase/client";

export interface Customer {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  shop_id: string;
  loyalty_points?: number;
  created_at: string;
  updated_at: string;
}

export const fetchCustomers = async (shopId: string): Promise<Customer[]> => {
  console.log('Fetching customers for shop:', shopId);
  
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

export const getCustomers = fetchCustomers; // Alias for backward compatibility

export const createCustomer = async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> => {
  console.log('Creating customer:', customer);
  
  const { data, error } = await supabase
    .from('customers')
    .insert(customer as any)
    .select()
    .single();

  if (error) {
    console.error('Error creating customer:', error);
    throw error;
  }

  return data as Customer;
};

export const addCustomer = createCustomer; // Alias for backward compatibility

export const updateCustomer = async (
  id: string, 
  updates: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>
): Promise<Customer> => {
  console.log('Updating customer:', id, updates);
  
  const { data, error } = await supabase
    .from('customers')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating customer:', error);
    throw error;
  }

  return data as Customer;
};

export const deleteCustomer = async (id: string): Promise<void> => {
  console.log('Deleting customer:', id);
  
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};
