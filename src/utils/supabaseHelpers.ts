
import { PostgrestError } from "@supabase/supabase-js";
import { isQueryError } from "./safeFilters";

/**
 * Safely convert a string to a UUID for Supabase queries
 * @param value Value to convert to UUID
 * @returns UUID suitable for Supabase
 */
export function asUUID(value: string | null | undefined): string | null {
  if (!value) return null;
  return value;
}

/**
 * Create a filter condition for UUID fields in Supabase
 * @param column Column name
 * @param value UUID value
 * @returns Filter object for Supabase
 */
export function filterByUUID(column: string, value: string | null | undefined): Record<string, string | null> {
  const result: Record<string, string | null> = {};
  result[column] = asUUID(value);
  return result;
}

/**
 * Safely access data from Supabase results
 * @param data Data object which might be undefined or an error
 * @param property Property to access
 * @param defaultValue Default value if property doesn't exist
 * @returns Property value or default
 */
export function safeDataAccess<T, K extends keyof T>(
  data: T | PostgrestError | null | undefined,
  property: K,
  defaultValue: T[K] | null = null
): T[K] | null {
  if (!data || isQueryError(data)) return defaultValue;
  return data[property] ?? defaultValue;
}

/**
 * Safely get profile data from Supabase results
 * @param data Data object which might be undefined or an error
 * @param property Property to access
 * @param defaultValue Default value if property doesn't exist
 * @returns Property value or default
 */
export function safeGetProfileData<T, K extends keyof T>(
  data: T | PostgrestError | null | undefined,
  property: K,
  defaultValue: T[K] | null = null
): T[K] | null {
  if (!data || isQueryError(data)) return defaultValue;
  return data[property] ?? defaultValue;
}

/**
 * Safely get data from Supabase results
 * @param data Data object which might be undefined or an error
 * @param property Property to access
 * @param defaultValue Default value if property doesn't exist
 * @returns Property value or default
 */
export function safeGet<T, K extends keyof T>(
  data: T | PostgrestError | null | undefined,
  property: K,
  defaultValue: T[K] | null = null
): T[K] | null {
  if (!data || isQueryError(data)) return defaultValue;
  return data[property] ?? defaultValue;
}
