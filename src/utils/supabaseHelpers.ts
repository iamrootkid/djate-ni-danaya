
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
 */
export function asUUID(id: string): string {
  return id as unknown as string;
}

/**
 * Safe data access with error handling
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
