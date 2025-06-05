
import { Role } from '@/types/auth';

export interface RoleConfig {
  allowedRoutes: string[];
  defaultRoute: string;
  permissions: string[];
  menuItems: string[];
}

export const ROLE_CONFIGS: Record<Role | 'super_admin', RoleConfig> = {
  super_admin: {
    allowedRoutes: [
      '/super-admin',
      '/dashboard',
      '/categories',
      '/products',
      '/staff',
      '/expenses',
      '/reports',
      '/invoices',
      '/settings'
    ],
    defaultRoute: '/super-admin',
    permissions: [
      'manage_all_shops',
      'manage_all_users',
      'system_admin',
      'manage_staff',
      'view_reports',
      'manage_products',
      'manage_categories',
      'manage_settings',
      'view_expenses',
      'manage_invoices'
    ],
    menuItems: [
      'super-admin',
      'dashboard',
      'categories',
      'products',
      'staff',
      'expenses',
      'reports',
      'invoices',
      'settings'
    ]
  },
  admin: {
    allowedRoutes: [
      '/dashboard',
      '/categories',
      '/products',
      '/staff',
      '/expenses',
      '/reports',
      '/invoices',
      '/settings'
    ],
    defaultRoute: '/dashboard',
    permissions: [
      'manage_staff',
      'view_reports',
      'manage_products',
      'manage_categories',
      'manage_settings',
      'view_expenses',
      'manage_invoices'
    ],
    menuItems: [
      'dashboard',
      'categories',
      'products',
      'staff',
      'expenses',
      'reports',
      'invoices',
      'settings'
    ]
  },
  employee: {
    allowedRoutes: ['/sales'],
    defaultRoute: '/sales',
    permissions: ['make_sales', 'view_products'],
    menuItems: ['sales']
  }
};

export function hasPermission(userRole: Role | 'super_admin' | null, permission: string): boolean {
  if (!userRole) return false;
  return ROLE_CONFIGS[userRole]?.permissions.includes(permission) || false;
}

export function canAccessRoute(userRole: Role | 'super_admin' | null, route: string): boolean {
  if (!userRole) return false;
  return ROLE_CONFIGS[userRole]?.allowedRoutes.includes(route) || false;
}

export function getDefaultRoute(userRole: Role | 'super_admin' | null): string {
  if (!userRole) return '/login';
  return ROLE_CONFIGS[userRole]?.defaultRoute || '/login';
}

export function getMenuItems(userRole: Role | 'super_admin' | null): string[] {
  if (!userRole) return [];
  return ROLE_CONFIGS[userRole]?.menuItems || [];
}

export function isValidRole(role: unknown): role is Role | 'super_admin' {
  return typeof role === 'string' && (role === 'admin' || role === 'employee' || role === 'super_admin');
}

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee'
} as const;

export type ExtendedRole = typeof ROLES[keyof typeof ROLES];

export const checkRoleHierarchy = (userRole: ExtendedRole, requiredRole: ExtendedRole): boolean => {
  const roleHierarchy = {
    [ROLES.SUPER_ADMIN]: 4,
    [ROLES.ADMIN]: 3,
    [ROLES.MANAGER]: 2,
    [ROLES.EMPLOYEE]: 1
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};
