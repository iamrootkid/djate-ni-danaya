
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Category } from "@/types/category";

// Added types for Insert
type InsertCategory = Database['public']['Tables']['categories']['Insert'];

// Category creation must use array for .insert()
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
    // created_at/updated_at auto
  };
  const { data, error } = await supabase
    .from("categories")
    .insert([insertObj])
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Insertion failed - no data returned");
  return data as Category;
}
