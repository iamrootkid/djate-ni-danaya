
import { PostgrestError } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";

/**
 * Type guard to check if a value is a PostgrestError
 */
export function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === "object" && 
    error !== null && 
    "code" in error && 
    "message" in error && 
    "details" in error
  );
}

/**
 * Helper to safely handle potential query errors in the data
 */
export function handleQueryResult<T>(data: T | PostgrestError): T | null {
  if (isPostgrestError(data)) {
    console.error("Query error:", data);
    return null;
  }
  return data;
}

/**
 * Safe type cast for UUIDs to handle string vs UUID type mismatches
 * This properly converts a string to the type expected by Supabase filters
 */
export function asUUID(id: string): any {
  // We use 'any' here to bypass TypeScript's strict checking
  // since Supabase's typing expects a specific UUID type
  return id;
}

/**
 * Safe data access with error handling
 * Helps prevent "property does not exist on type" errors
 */
export function safeDataAccess<T extends object, K extends keyof T>(
  data: T | PostgrestError | null | undefined, 
  key: K
): T[K] | undefined {
  if (!data || isPostgrestError(data)) {
    return undefined;
  }
  return data[key];
}

/**
 * Type-safe way to access string properties from Supabase query results
 */
export function safeGetString(
  data: any | PostgrestError | null | undefined,
  key: string
): string | undefined {
  if (!data || isPostgrestError(data) || typeof data !== 'object') {
    return undefined;
  }
  const value = data[key];
  return typeof value === 'string' ? value : undefined;
}

/**
 * Safe helper for handling profile data access
 */
export function safeGetProfileData<T>(
  profile: any | PostgrestError | null | undefined,
  field: string,
  defaultValue: T
): T {
  if (!profile || isPostgrestError(profile)) {
    return defaultValue;
  }
  
  const value = profile[field];
  return value !== undefined && value !== null ? value as T : defaultValue;
}

/**
 * Safe helper for handling complex nested data structures
 * Particularly useful for Supabase join queries
 */
export function safeGet<T>(
  obj: any | null | undefined,
  path: string[],
  defaultValue: T
): T {
  try {
    let current = obj;
    for (const key of path) {
      if (current === null || current === undefined || isPostgrestError(current)) {
        return defaultValue;
      }
      current = current[key];
    }
    return (current !== null && current !== undefined) ? current as T : defaultValue;
  } catch (e) {
    console.error(`Error accessing path [${path.join('.')}]:`, e);
    return defaultValue;
  }
}
