
/**
 * Valid user roles in the application
 */
export type Role = 'admin' | 'employee';

/**
 * Authentication user data structure
 */
export interface AuthUser {
  id: string;
  email: string;
  role?: Role;
  firstName?: string;
  lastName?: string;
}

/**
 * Error type for authentication operations
 */
export interface AuthError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * Interface for invoice modification return data
 */
export interface ReturnedItem {
  id: string;
  name: string;
  quantity: number;
  originalQuantity: number;
  selected: boolean;
  price: number;
}

/**
 * Interface for invoice modification data
 */
export interface InvoiceModification {
  id: string;
  invoice_id: string;
  modification_type: 'price' | 'return' | 'other';
  new_amount: number;
  reason: string;
  modified_by: string;
  shop_id: string;
  created_at: string;
  returned_items?: ReturnedItem[];
}
