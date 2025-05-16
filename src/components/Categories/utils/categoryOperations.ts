
import { supabase } from "@/integrations/supabase/client";

/**
 * Create a new category in the database.
 * @param params Object with name (string) and shop_id (string)
 * @returns The created category, or the error result from Supabase
 */
export async function createCategory({
  name,
  shop_id,
}: {
  name: string;
  shop_id: string;
}) {
  const { data, error } = await supabase
    .from("categories")
    .insert([
      { name, shop_id }
    ])
    .select()
    .maybeSingle();

  if (error) {
    return error;
  }
  return data;
}
