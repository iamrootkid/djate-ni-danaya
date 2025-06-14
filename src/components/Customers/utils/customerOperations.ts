
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
    .eq('shop_id', shopId as any)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }

  return (data || []) as any as Customer[];
};

export const createCustomer = async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>, shopId?: string): Promise<Customer> => {
  const currentShopId = shopId || localStorage.getItem('shopId');
  if (!currentShopId) throw new Error("Shop ID is required to create a customer.");

  const customerData = {
    first_name: customer.first_name || null,
    last_name: customer.last_name || null,
    email: customer.email || null,
    phone: customer.phone || null,
    loyalty_points: customer.loyalty_points || 0,
    shop_id: currentShopId,
  };

  const { data, error } = await supabase
    .from('customers')
    .insert([customerData] as any)
    .select()
    .single();

  if (error) {
    console.error('Error creating customer:', error);
    throw error;
  }

  return data as any as Customer;
};

export const updateCustomer = async (id: string, customer: Partial<Omit<Customer, 'id' | 'shop_id' | 'created_at' | 'updated_at'>>, shopId?: string): Promise<Customer> => {
  const currentShopId = shopId || localStorage.getItem('shopId');
  if (!currentShopId) throw new Error("Shop ID is required to update a customer.");

  const updateData: any = {};
  
  if (customer.first_name !== undefined) {
    updateData.first_name = customer.first_name;
  }
  if (customer.last_name !== undefined) {
    updateData.last_name = customer.last_name;
  }
  if (customer.email !== undefined) {
    updateData.email = customer.email;
  }
  if (customer.phone !== undefined) {
    updateData.phone = customer.phone;
  }
  if (customer.loyalty_points !== undefined) {
    updateData.loyalty_points = customer.loyalty_points;
  }

  const { data, error } = await supabase
    .from('customers')
    .update(updateData)
    .eq('id', id as any)
    .eq('shop_id', currentShopId as any)
    .select()
    .single();

  if (error) {
    console.error('Error updating customer:', error);
    throw error;
  }

  return data as any as Customer;
};

export const deleteCustomer = async (id: string, shopId?: string): Promise<void> => {
  const currentShopId = shopId || localStorage.getItem('shopId');
  if (!currentShopId) throw new Error("Shop ID is required to delete a customer.");

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id as any)
    .eq('shop_id', currentShopId as any);

  if (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

// Add alias for backward compatibility
export const addCustomer = createCustomer;
