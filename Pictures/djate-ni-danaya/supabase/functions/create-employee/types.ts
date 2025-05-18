export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ShopVerificationResult {
  exists: boolean;
  error?: string;
}

export interface EmailCheckResult {
  exists: boolean;
  error?: string;
}

export interface AuthUserResult {
  success: boolean;
  userId?: string;
  error?: string;
}

export interface StaffResult {
  success: boolean;
  error?: string;
}

export interface ProfileResult {
  success: boolean;
  error?: string;
}

export interface ExistingUser {
  id: string;
  [key: string]: any;
}

export interface RequestBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  shopId: string;
  isPredefinedUser: boolean;
} 