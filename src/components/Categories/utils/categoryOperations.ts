
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/category";

export async function createCategory({
  name,
  shop_id,
}: {
  name: string;
  shop_id: string;
}): Promise<Category | Error> {
  const { data, error } = await supabase
    .from("categories")
    .insert({ name, shop_id })
    .select()
    .maybeSingle();

  if (error) {
    return error;
  }
  return data as Category;
}
