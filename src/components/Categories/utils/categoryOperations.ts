
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
  description: string | null;
  shop_id: string;
  created_at: string;
  updated_at: string;
}

export const getCategories = async (shopId: string): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('shop_id', shopId)
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  return data as Category[];
};

export const createCategory = async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>, shopId: string): Promise<Category> => {
  const categoryData = {
    name: category.name,
    description: category.description,
    shop_id: shopId,
  };

  const { data, error } = await supabase
    .from('categories')
    .insert(categoryData)
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    throw error;
  }

  return data as Category;
};

export const updateCategory = async (id: string, category: Partial<Omit<Category, 'id' | 'shop_id' | 'created_at' | 'updated_at'>>, shopId: string): Promise<Category> => {
  const updateData: any = {};
  
  if (category.name !== undefined) {
    updateData.name = category.name;
  }
  if (category.description !== undefined) {
    updateData.description = category.description;
  }

  const { data, error } = await supabase
    .from('categories')
    .update(updateData)
    .eq('id', id)
    .eq('shop_id', shopId)
    .select()
    .single();

  if (error) {
    console.error('Error updating category:', error);
    throw error;
  }

  return data as Category;
};

export const deleteCategory = async (id: string, shopId: string): Promise<void> => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('shop_id', shopId);

  if (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};
