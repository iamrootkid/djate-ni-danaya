
import { PostgrestError } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";

// Type guard to check if a value is a PostgrestError
export function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === "object" && 
    error !== null && 
    "code" in error && 
    "message" in error && 
    "details" in error
  );
}

// Helper to safely handle potential query errors in the data
export function handleQueryResult<T>(data: T | PostgrestError): T | null {
  if (isPostgrestError(data)) {
    console.error("Query error:", data);
    return null;
  }
  return data;
}

// Safe type cast for UUIDs (with explicit return type to fix errors)
export function asUUID(id: string): `${string}-${string}-${string}-${string}-${string}` {
  // Cast the string to a properly formatted UUID string type
  return id as `${string}-${string}-${string}-${string}-${string}`;
}

// Safe data access with error handling
export function safeDataAccess<T extends object, K extends keyof T>(
  data: T | PostgrestError | null | undefined, 
  key: K
): T[K] | undefined {
  if (!data || isPostgrestError(data)) {
    return undefined;
  }
  return data[key];
}

// Type-safe way to access string properties from Supabase query results
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

// Safe helper for handling profile data access
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

// Safe helper for handling complex nested data structures
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

// Specific helper for safely filtering by ID with proper UUID formatting
export function filterByUUID(column: string, id: string) {
  // This creates a filter condition for any column name with proper UUID typing
  return { [column]: asUUID(id) };
}

// Helper to safely handle Supabase query conditions with proper typing
export function eqFilter(column: string, value: string | number | boolean) {
  // For columns that expect UUIDs, we need to ensure they're properly formatted
  if (
    column.toLowerCase().endsWith('_id') || 
    column.toLowerCase() === 'id'
  ) {
    return typeof value === 'string' ? asUUID(value) : value;
  }
  
  return value;
}

// Helper to safely extract UUID values from objects
export function getUUID(data: any, key: string): `${string}-${string}-${string}-${string}-${string}` | null {
  if (!data || !data[key]) return null;
  return asUUID(data[key]);
}

// Specific helper for database field matching
export function matchFilter(column: string, value: string | number | boolean) {
  return { [column]: value };
}

// Type guard for user role
export function isValidRole(role: string): role is "admin" | "employee" {
  return role === "admin" || role === "employee";
}

// Safe data access with type assertion
export function safeGetData<T>(data: any | null | undefined, defaultValue: T): T {
  if (!data) return defaultValue;
  return data as T;
}

// New helper: Safe check for specific role
export function hasRole(role: unknown, expectedRole: "admin" | "employee"): boolean {
  return typeof role === 'string' && role === expectedRole;
}

// New helper: Safe type assertion for data objects with error handling
export function safeTypeAssert<T>(data: any, fallback: T): T {
  if (!data || isPostgrestError(data)) {
    return fallback;
  }
  return data as T;
}

// Rate limiter class to prevent 420 errors
class RateLimiter {
  private timestamps: Record<string, number[]> = {};
  private maxRequestsPerWindow: number;
  private windowMs: number;

  constructor(maxRequestsPerWindow = 5, windowMs = 1000) {
    this.maxRequestsPerWindow = maxRequestsPerWindow;
    this.windowMs = windowMs;
  }

  shouldThrottle(key: string): boolean {
    const now = Date.now();
    if (!this.timestamps[key]) {
      this.timestamps[key] = [];
    }

    // Remove timestamps outside the window
    this.timestamps[key] = this.timestamps[key].filter(
      time => now - time < this.windowMs
    );

    // Check if we've reached the limit
    if (this.timestamps[key].length >= this.maxRequestsPerWindow) {
      return true;
    }

    // Add current timestamp
    this.timestamps[key].push(now);
    return false;
  }

  getBackoffTime(key: string): number {
    if (!this.timestamps[key] || this.timestamps[key].length === 0) {
      return 0;
    }
    
    // Calculate when the oldest request will expire from the window
    const oldestTimestamp = Math.min(...this.timestamps[key]);
    const timeToWait = this.windowMs - (Date.now() - oldestTimestamp);
    
    return Math.max(0, timeToWait) + 100; // Add small buffer
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter(3, 1000);

// Safe throttled database query wrapper
export async function safeQueryWithRateLimit<T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let retries = 0;
  
  while (retries <= maxRetries) {
    if (rateLimiter.shouldThrottle(queryKey)) {
      const backoffTime = rateLimiter.getBackoffTime(queryKey);
      console.log(`Rate limiting ${queryKey}, waiting ${backoffTime}ms before retry`);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
      retries++;
      continue;
    }
    
    try {
      return await queryFn();
    } catch (error: any) {
      if (error?.code === '429' || error?.message?.includes('rate limit')) {
        const backoffTime = Math.pow(2, retries) * 500; // Exponential backoff
        console.log(`Rate limit hit for ${queryKey}, backing off for ${backoffTime}ms`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        retries++;
      } else {
        // Not a rate limit error, rethrow
        throw error;
      }
    }
  }
  
  throw new Error(`Failed after ${maxRetries} retries due to rate limiting`);
}
