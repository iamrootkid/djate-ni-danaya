export type Role = 'admin' | 'employee';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  shopId: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: Error | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  shopId: string;
  rememberMe?: boolean;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkPermission: (permission: string) => boolean;
}

export type Permission = 
  | 'manage_staff'
  | 'view_reports'
  | 'manage_products'
  | 'manage_categories'
  | 'manage_settings'
  | 'view_expenses'
  | 'manage_invoices'
  | 'make_sales'
  | 'view_products'; 