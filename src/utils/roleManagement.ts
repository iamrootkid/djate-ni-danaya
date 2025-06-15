import { Role } from '@/types/auth';

export interface RoleConfig {
  allowedRoutes: string[];
  defaultRoute: string;
  permissions: string[];
  menuItems: string[];
}

export const ROLE_CONFIGS: Record<Role, RoleConfig> = {
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

export function hasPermission(userRole: Role | null, permission: string): boolean {
  if (!userRole) return false;
  return ROLE_CONFIGS[userRole].permissions.includes(permission);
}

export function canAccessRoute(userRole: Role | null, route: string): boolean {
  if (!userRole) return false;
  return ROLE_CONFIGS[userRole].allowedRoutes.includes(route);
}

export function getDefaultRoute(userRole: Role | null): string {
  if (!userRole) return '/login';
  return ROLE_CONFIGS[userRole].defaultRoute;
}

export function getMenuItems(userRole: Role | null): string[] {
  if (!userRole) return [];
  return ROLE_CONFIGS[userRole].menuItems;
}

export function isValidRole(role: unknown): role is Role {
  return typeof role === 'string' && (role === 'admin' || role === 'employee');
}

export const ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES];

// Renamed to avoid duplication with the function above
export const checkRoleHierarchy = (userRole: Role, requiredRole: Role): boolean => {
  const roleHierarchy = {
    [ROLES.ADMIN]: 3,
    [ROLES.EMPLOYEE]: 1
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};
