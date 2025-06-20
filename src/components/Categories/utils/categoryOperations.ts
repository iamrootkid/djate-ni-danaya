
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
    .eq('shop_id', shopId as any)
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  return (data || []) as any as Category[];
};

export const createCategory = async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>, shopId?: string): Promise<Category> => {
  const currentShopId = shopId || localStorage.getItem('shopId');
  if (!currentShopId) {
    throw new Error('Shop ID is required to create a category.');
  }

  const categoryData = {
    name: category.name,
    description: category.description || null,
    shop_id: currentShopId,
  };

  const { data, error } = await supabase
    .from('categories')
    .insert([categoryData] as any)
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    throw error;
  }

  return data as any as Category;
};

export const updateCategory = async (id: string, category: Partial<Omit<Category, 'id' | 'shop_id' | 'created_at' | 'updated_at'>>, shopId?: string): Promise<Category> => {
  const currentShopId = shopId || localStorage.getItem('shopId');
  if (!currentShopId) {
    throw new Error('Shop ID is required to update a category.');
  }
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
    .eq('id', id as any)
    .eq('shop_id', currentShopId as any)
    .select()
    .single();

  if (error) {
    console.error('Error updating category:', error);
    throw error;
  }

  return data as any as Category;
};

export const deleteCategory = async (id: string, shopId?: string): Promise<void> => {
  const currentShopId = shopId || localStorage.getItem('shopId');
  if (!currentShopId) {
    throw new Error('Shop ID is required to delete a category.');
  }
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id as any)
    .eq('shop_id', currentShopId as any);

  if (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};
