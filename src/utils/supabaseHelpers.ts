
import { supabase } from "@/integrations/supabase/client";
import { Role } from '@/types/auth';
import { PostgrestError } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

/**
 * Check if a given role is valid
 * @param role The role to validate
 * @returns Boolean indicating if the role is valid
 */
export function isValidRole(role: unknown): role is Role {
  return typeof role === 'string' && (role === 'admin' || role === 'employee');
}

/**
 * Check if the current user has a specific role
 * @param requiredRole The role to check for
 * @returns Promise<boolean> True if the user has the role, false otherwise
 */
export async function hasRole(requiredRole: Role): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return false;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (error || !profile) {
      console.error('Error fetching user role:', error);
      return false;
    }

    return isValidRole(profile.role) && profile.role === requiredRole;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
}

/**
 * Helper functions for safely handling Supabase query operations with TypeScript
 */

/**
 * Safe type conversion for UUID fields
 * @param value The value to convert to UUID format
 */
export function asUUID(value: string): string {
  return value as unknown as string; // Type casting to satisfy Supabase type system
}

/**
 * Type guard to check if an object is a PostgrestError
 * @param obj Object to check
 */
export function isPostgrestError(obj: any): obj is PostgrestError {
  return obj && typeof obj === 'object' && 'code' in obj && 'message' in obj;
}

/**
 * Create a safe filter object for the `.match()` method with UUID handling
 * @param field The field name to filter on
 * @param value The value to match
 */
export function filterByUUID(field: string, value: string): Record<string, string> {
  if (!value) {
    throw new Error(`Invalid value for ${field}`);
  }
  return { [field]: asUUID(value) };
}

/**
 * Safely get data from an object with proper type handling
 * @param obj The object to access
 * @param path Array representing the path to the desired property
 * @param defaultValue The default value to return if property doesn't exist
 */
export function safeGet<T>(obj: any, path: (string | number)[], defaultValue: T): T {
  if (!obj || !path || path.length === 0) {
    return defaultValue;
  }

  let current = obj;
  for (const key of path) {
    if (current === null || current === undefined || !Object.prototype.hasOwnProperty.call(current, key)) {
      return defaultValue;
    }
    current = current[key];
  }

  return (current === null || current === undefined) ? defaultValue : current as T;
}

/**
 * Safely access data from profile or other object
 * @param data The data object from Supabase
 * @param field The field to access
 * @param defaultValue Default value if field doesn't exist
 */
export function safeGetProfileData<T>(data: any, field: string, defaultValue: T): T {
  if (!data || data[field] === undefined || data[field] === null) {
    return defaultValue;
  }
  return data[field] as T;
}

/**
 * Type-safe handler for query data that might be an error
 * @param data The data object from query result
 * @param transformer Function to transform data if it's not an error
 */
export function handleQueryResult<T, R>(
  data: T | PostgrestError, 
  transformer: (validData: T) => R
): R | null {
  if (isPostgrestError(data)) {
    console.error("Error in query result:", data);
    return null;
  }
  return transformer(data);
}

/**
 * Safely get data from query result
 * @param data The data object from query result
 * @param field The field to access
 */
export function safeDataAccess<T>(data: any, field: string): T | null {
  if (!data || !Object.prototype.hasOwnProperty.call(data, field)) {
    return null;
  }
  return data[field] as T;
}

/**
 * Rate-limited query with caching to prevent excessive database calls
 * @param cacheKey Unique key to identify this query
 * @param queryFn The actual query function to execute
 */
export async function safeQueryWithRateLimit<T>(cacheKey: string, queryFn: () => Promise<T>): Promise<T> {
  // Simple in-memory cache implementation
  const cache = (window as any).__queryCache = (window as any).__queryCache || {};
  const now = Date.now();
  
  // Check if we have a cached result that's still fresh (less than 30 seconds old)
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < 30000) {
    return cache[cacheKey].data;
  }
  
  // Execute the query
  try {
    const result = await queryFn();
    
    // Store in cache
    cache[cacheKey] = {
      timestamp: now,
      data: result
    };
    
    return result;
  } catch (error) {
    console.error(`Error executing query for ${cacheKey}:`, error);
    throw error;
  }
}

/**
 * Type-safe assertion for Supabase query results
 * @param data The data to assert
 * @param fallback A fallback value if data is invalid
 */
export function safeTypeAssert<T>(data: any, fallback: T): T {
  if (!data) return fallback;
  return data as T;
}

/**
 * Safely perform Supabase match query with error handling for TypeScript
 * @param table The Supabase table to query
 * @param field The field to match on
 * @param value The value to match
 */
export function safeMatchQuery<T extends keyof Database['public']['Tables']>(
  table: T,
  field: string,
  value: string
) {
  return supabase
    .from(table as string)
    .select('*')
    .eq(field, isUUIDField(field) ? asUUID(value) : value);
}

/**
 * Check if a field is likely a UUID field based on naming convention
 */
function isUUIDField(field: string): boolean {
  return field.toLowerCase().endsWith('_id');
}
