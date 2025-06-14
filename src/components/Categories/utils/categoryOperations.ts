
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];

export const fetchCategories = async (shopId: string): Promise<Category[]> => {
  if (!shopId) {
    console.warn("No shop ID provided for fetching categories");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("shop_id", shopId)
      .order("name");

    if (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchCategories:", error);
    return [];
  }
};

export const createCategory = async (
  categoryData: Omit<CategoryInsert, "shop_id">,
  shopId: string
): Promise<Category> => {
  if (!shopId) {
    throw new Error("Shop ID is required for creating a category");
  }

  try {
    const { data, error } = await supabase
      .from("categories")
      .insert([{ ...categoryData, shop_id: shopId }])
      .select()
      .single();

    if (error) {
      console.error("Error creating category:", error);
      throw error;
    }

    if (!data) {
      throw new Error("No data returned from category creation");
    }

    return data;
  } catch (error) {
    console.error("Error in createCategory:", error);
    throw error;
  }
};

export const updateCategory = async (
  categoryId: string,
  categoryData: Partial<Omit<CategoryInsert, "shop_id">>,
  shopId: string
): Promise<Category> => {
  if (!shopId) {
    throw new Error("Shop ID is required for updating a category");
  }

  try {
    const { data, error } = await supabase
      .from("categories")
      .update(categoryData)
      .eq("id", categoryId)
      .eq("shop_id", shopId)
      .select()
      .single();

    if (error) {
      console.error("Error updating category:", error);
      throw error;
    }

    if (!data) {
      throw new Error("No data returned from category update");
    }

    return data;
  } catch (error) {
    console.error("Error in updateCategory:", error);
    throw error;
  }
};

export const deleteCategory = async (categoryId: string, shopId: string): Promise<void> => {
  if (!shopId) {
    throw new Error("Shop ID is required for deleting a category");
  }

  try {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId)
      .eq("shop_id", shopId);

    if (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    throw error;
  }
};
