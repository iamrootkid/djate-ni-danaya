
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type CustomerRow = Database['public']['Tables']['customers']['Row'];
type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
type CustomerUpdate = Database['public']['Tables']['customers']['Update'];

export interface Customer {
  id: string;
  shop_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  loyalty_points: number;
  created_at: string;
  updated_at: string;
}

export const fetchCustomers = async (shopId: string): Promise<Customer[]> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('shop_id', shopId)
      .order('first_name');

    if (error) throw error;
    
    return (data || []).map((row: any) => ({
      id: row.id,
      shop_id: row.shop_id,
      first_name: row.first_name || '',
      last_name: row.last_name || '',
      email: row.email || '',
      phone: row.phone || '',
      loyalty_points: row.loyalty_points || 0,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

export const createCustomer = async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> => {
  try {
    const insertData: CustomerInsert = {
      shop_id: customerData.shop_id,
      first_name: customerData.first_name,
      last_name: customerData.last_name,
      email: customerData.email,
      phone: customerData.phone,
      loyalty_points: customerData.loyalty_points || 0
    };

    const { data, error } = await supabase
      .from('customers')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from insert');
    
    return data as Customer;
  } catch (error: any) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

export const updateCustomer = async (id: string, updates: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>): Promise<Customer> => {
  try {
    const updateData: CustomerUpdate = {
      first_name: updates.first_name,
      last_name: updates.last_name,
      email: updates.email,
      phone: updates.phone,
      loyalty_points: updates.loyalty_points
    };

    const { data, error } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from update');
    
    return data as Customer;
  } catch (error: any) {
    console.error('Error updating customer:', error);
    throw error;
  }
};

export const deleteCustomer = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error: any) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

// Legacy exports for backward compatibility
export const getCustomers = fetchCustomers;
export const addCustomer = createCustomer;
