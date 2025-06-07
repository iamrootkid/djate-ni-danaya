
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
  description?: string;
  shop_id: string;
  created_at: string;
  updated_at: string;
}

export const fetchCategories = async (shopId: string): Promise<Category[]> => {
  console.log('Fetching categories for shop:', shopId);
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('shop_id', shopId)
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  return (data || []).map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    shop_id: item.shop_id,
    created_at: item.created_at,
    updated_at: item.updated_at,
  }));
};

export const createCategory = async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> => {
  console.log('Creating category:', category);
  
  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: category.name,
      description: category.description,
      shop_id: category.shop_id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    shop_id: data.shop_id,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

export const updateCategory = async (id: string, updates: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>): Promise<Category> => {
  console.log('Updating category:', id, updates);
  
  const updateData: any = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.shop_id !== undefined) updateData.shop_id = updates.shop_id;
  
  const { data, error } = await supabase
    .from('categories')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating category:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    shop_id: data.shop_id,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

export const deleteCategory = async (id: string): Promise<void> => {
  console.log('Deleting category:', id);
  
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};
