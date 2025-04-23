
import { PostgrestFilterBuilder } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

/**
 * Type for checking if a query result is an error
 */
export interface SelectQueryError {
  code: string;
  message: string;
  details?: string;
}

/**
 * Safely converts a string to UUID format for database operations
 */
export function asUUID(value: string | null | undefined): string | null {
  if (!value) return null;
  return value;
}

/**
 * Type-safe filter utility for UUID fields
 */
export function filterByUUID(column: string, value: string | null | undefined): string {
  if (!value) {
    throw new Error(`Invalid UUID value for ${column}`);
  }
  return value;
}

/**
 * Type-safe filter utility for .eq() operations on any column
 */
export function safeEq<T extends Record<string, any>>(
  query: PostgrestFilterBuilder<T>,
  column: string, 
  value: string | null | undefined
): PostgrestFilterBuilder<T> {
  if (!value) {
    return query;
  }
  
  return query.eq(column, value);
}

/**
 * Type-safe filter utility for shop_id specifically
 */
export function filterByShopId<T extends Record<string, any>>(
  query: PostgrestFilterBuilder<T>,
  shopId: string | null | undefined
): PostgrestFilterBuilder<T> {
  if (!shopId) {
    return query;
  }
  
  return query.eq("shop_id", shopId);
}

/**
 * Type-safe filter utility for matching multiple columns
 */
export function safeMatch<T extends Record<string, any>>(
  query: PostgrestFilterBuilder<T>,
  filters: Record<string, string | null | undefined>
): PostgrestFilterBuilder<T> {
  // Filter out null/undefined values
  const validFilters: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(filters)) {
    if (value !== null && value !== undefined) {
      validFilters[key] = value;
    }
  }
  
  if (Object.keys(validFilters).length === 0) {
    return query;
  }
  
  return query.match(validFilters);
}

/**
 * Helper to create a type-safe insert object for a table
 */
export function safeInsert<T extends Record<string, any>>(
  data: Record<string, any>
): Record<string, any> {
  const validData: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined) {
      validData[key] = value;
    }
  }
  
  return validData as unknown as T;
}

/**
 * Type-safe utility for Supabase query results
 * Ensures proper handling of data or error results
 */
export function safeData<T>(data: any): T | null {
  if (!data || typeof data === 'object' && 'code' in data && 'message' in data) {
    return null;
  }
  return data as T;
}

/**
 * Type-safe property access for possibly undefined objects
 */
export function safeGet<T>(obj: any, prop: string | string[], defaultValue: T): T {
  if (!obj) {
    return defaultValue;
  }
  
  if (Array.isArray(prop)) {
    let current = obj;
    for (const key of prop) {
      if (current === undefined || current === null || typeof current !== 'object') {
        return defaultValue;
      }
      current = current[key];
    }
    return (current !== undefined && current !== null) ? current as T : defaultValue;
  }
  
  return obj[prop] !== undefined ? obj[prop] as T : defaultValue;
}

/**
 * Safely create a filter object for Supabase .match() method
 */
export function createMatchFilter(key: string, value: string | null | undefined): Record<string, string> | null {
  if (!value) {
    return null;
  }
  return { [key]: value };
}

/**
 * Safely check if a query result is an error
 */
export function isQueryError(result: any): boolean {
  return result && typeof result === 'object' && 'code' in result && 'message' in result;
}

/**
 * Cast any string to an appropriate shop ID format for Supabase queries
 * This helps with TypeScript type compatibility
 */
export function asShopId(shopId: string | null | undefined): any {
  return shopId;
}

/**
 * Helper to safely cast database table field values
 * Useful for handling type mismatches in Supabase responses
 */
export function castTableValue<T>(value: any): T {
  return value as T;
}
