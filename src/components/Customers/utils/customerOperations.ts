
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types/customer";

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

export const createCustomer = async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> => {
  console.log('Creating customer:', customer);
  
  const { data, error } = await supabase
    .from('customers')
    .insert(customer)
    .select()
    .single();

  if (error) {
    console.error('Error creating customer:', error);
    throw error;
  }

  return data as Customer;
};

export const updateCustomer = async (
  id: string, 
  updates: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>
): Promise<Customer> => {
  console.log('Updating customer:', id, updates);
  
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
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
