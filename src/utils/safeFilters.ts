
import { PostgrestFilterBuilder } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import { asUUID } from "@/utils/supabaseHelpers";

// Type-safe filter utility for .eq() operations on UUID fields
export function safeEq<T extends keyof Database["public"]["Tables"]>(
  query: PostgrestFilterBuilder<any>,
  column: string, 
  value: string | null
): PostgrestFilterBuilder<any> {
  if (!value) {
    return query;
  }
  
  // Cast string to UUID for safety with UUID columns
  if (column.toLowerCase().includes('id')) {
    return query.eq(column, asUUID(value));
  }
  
  return query.eq(column, value);
}

// Type-safe filter utility for shop_id specifically
export function filterByShopId<T extends keyof Database["public"]["Tables"]>(
  query: PostgrestFilterBuilder<any>,
  shopId: string | null
): PostgrestFilterBuilder<any> {
  if (!shopId) {
    return query;
  }
  
  return query.eq("shop_id", asUUID(shopId));
}

// Type-safe filter utility for matching multiple columns
export function safeMatch<T extends keyof Database["public"]["Tables"]>(
  query: PostgrestFilterBuilder<any>,
  filters: Record<string, string | null>
): PostgrestFilterBuilder<any> {
  // Filter out null/undefined values
  const validFilters: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(filters)) {
    if (value !== null && value !== undefined) {
      // Handle UUID columns
      if (key.toLowerCase().includes('id')) {
        validFilters[key] = asUUID(value);
      } else {
        validFilters[key] = value;
      }
    }
  }
  
  if (Object.keys(validFilters).length === 0) {
    return query;
  }
  
  return query.match(validFilters);
}

// Helper to create a type-safe insert object for a table
export function safeInsert<T extends keyof Database["public"]["Tables"]>(
  data: Record<string, any>
): Record<string, any> {
  const validData: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined) {
      if (key.toLowerCase().includes('id') && typeof value === 'string') {
        validData[key] = asUUID(value);
      } else {
        validData[key] = value;
      }
    }
  }
  
  return validData;
}
