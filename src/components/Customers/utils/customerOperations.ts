
import { supabase } from "@/integrations/supabase/client";

export interface Customer {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  shop_id: string;
  loyalty_points: number;
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

  return (data || []).map(item => ({
    id: item.id,
    first_name: item.first_name,
    last_name: item.last_name,
    email: item.email,
    phone: item.phone,
    shop_id: item.shop_id,
    loyalty_points: item.loyalty_points || 0,
    created_at: item.created_at,
    updated_at: item.updated_at,
  }));
};

export const getCustomers = fetchCustomers; // Alias for backward compatibility

export const createCustomer = async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> => {
  console.log('Creating customer:', customer);
  
  const { data, error } = await supabase
    .from('customers')
    .insert([{
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email,
      phone: customer.phone,
      shop_id: customer.shop_id,
      loyalty_points: customer.loyalty_points || 0,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating customer:', error);
    throw error;
  }

  return {
    id: data.id,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    phone: data.phone,
    shop_id: data.shop_id,
    loyalty_points: data.loyalty_points || 0,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

export const addCustomer = createCustomer; // Alias for backward compatibility

export const updateCustomer = async (
  id: string, 
  updates: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>
): Promise<Customer> => {
  console.log('Updating customer:', id, updates);
  
  const updateData: any = {};
  if (updates.first_name !== undefined) updateData.first_name = updates.first_name;
  if (updates.last_name !== undefined) updateData.last_name = updates.last_name;
  if (updates.email !== undefined) updateData.email = updates.email;
  if (updates.phone !== undefined) updateData.phone = updates.phone;
  if (updates.shop_id !== undefined) updateData.shop_id = updates.shop_id;
  if (updates.loyalty_points !== undefined) updateData.loyalty_points = updates.loyalty_points;
  
  const { data, error } = await supabase
    .from('customers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating customer:', error);
    throw error;
  }

  return {
    id: data.id,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    phone: data.phone,
    shop_id: data.shop_id,
    loyalty_points: data.loyalty_points || 0,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
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
