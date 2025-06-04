
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Category } from "@/types/category";

// Use the correct Supabase types
type InsertCategory = Database['public']['Tables']['categories']['Insert'];
type DBCategory = Database['public']['Tables']['categories']['Row'];

// Category creation using proper Supabase types
export async function createCategory({
  name,
  shop_id,
  description,
}: {
  name: string;
  shop_id: string;
  description?: string | null;
}): Promise<Category> {
  const insertObj: InsertCategory = {
    name,
    shop_id,
    description: description ?? null,
  };
  
  const { data, error } = await supabase
    .from("categories")
    .insert(insertObj)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error("Insertion failed - no data returned");
  
  // Convert DB row to our Category type
  return {
    id: data.id,
    name: data.name,
    shop_id: data.shop_id,
    description: data.description,
    created_at: data.created_at,
    updated_at: data.updated_at,
  } as Category;
}
