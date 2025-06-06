
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type CategoryRow = Database['public']['Tables']['categories']['Row'];
type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

export interface Category {
  id: string;
  name: string;
  description?: string;
  shop_id: string;
  created_at: string;
  updated_at: string;
}

export const fetchCategories = async (shopId: string): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('shop_id', shopId)
      .order('name');

    if (error) throw error;
    return (data || []) as Category[];
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const createCategory = async (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> => {
  try {
    const insertData: CategoryInsert = {
      name: categoryData.name,
      description: categoryData.description || null,
      shop_id: categoryData.shop_id
    };

    const { data, error } = await supabase
      .from('categories')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from insert');
    
    return data as Category;
  } catch (error: any) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (id: string, updates: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>): Promise<Category> => {
  try {
    const updateData: CategoryUpdate = {
      name: updates.name,
      description: updates.description
    };

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from update');
    
    return data as Category;
  } catch (error: any) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error: any) {
    console.error('Error deleting category:', error);
    throw error;
  }
};
