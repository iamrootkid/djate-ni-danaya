
import { PostgrestError } from "@supabase/supabase-js";

/**
 * Type guard to check if an object is a PostgrestError
 * @param obj Object to check
 */
export function isQueryError(obj: any): obj is PostgrestError {
  return obj && typeof obj === 'object' && 'code' in obj && 'message' in obj;
}

/**
 * Safely get data from a Supabase query result
 * @param result The query result which might contain data or errors
 * @param defaultValue Default value if no valid result
 */
export function safeQueryResult<T>(result: T | PostgrestError | null, defaultValue: T): T {
  if (!result || isQueryError(result)) {
    return defaultValue;
  }
  return result;
}

/**
 * Safely get a single result from a Supabase query
 * @param result The query result which might contain data or errors
 * @param defaultValue Default value if no valid result
 */
export function safeSingleResult<T>(result: T | PostgrestError | null, defaultValue: T = {} as T): T {
  if (!result || isQueryError(result)) {
    return defaultValue;
  }
  return result;
}

/**
 * Convert parameter to a safe string format for Supabase queries
 * @param value Value to format as parameter
 * @returns Safe parameter string
 */
export function asParam(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}

/**
 * Helper function to cast a value to any type
 * @param value Any value to cast to any type
 * @returns The same value with any type
 */
export function asAny(value: unknown): any {
  return value as any;
}

/**
 * Filter query by shop_id
 * @param query Supabase query
 * @param shopId Shop ID to filter by
 * @returns Filtered query
 */
export function filterByShopId(query: any, shopId: string | null): any {
  if (!shopId) {
    console.warn("No shop ID provided for filtering");
    return query;
  }
  return query.eq("shop_id", shopId);
}

/**
 * Safely get a property from an object
 * @param obj Object to get property from
 * @param key Property key
 * @param defaultValue Default value if property doesn't exist
 * @returns Property value or default value
 */
export function safeGet<T, K extends keyof T>(obj: T | null | undefined, key: K, defaultValue: T[K] | null = null): T[K] | null {
  if (!obj) return defaultValue;
  return obj[key] !== undefined ? obj[key] : defaultValue;
}
