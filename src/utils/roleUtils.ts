
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if the current user has the specified role
 * @param requiredRole The role to check for
 * @returns Promise<boolean> True if the user has the role, false otherwise
 */
export const checkUserRole = async (requiredRole: 'admin' | 'employee' | 'super_admin'): Promise<boolean> => {
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

    return profile.role === requiredRole;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
};

/**
 * Gets the current user's role from localStorage
 * @returns 'admin' | 'employee' | 'super_admin' | null The user's role or null if not found
 */
export const getCurrentUserRole = (): 'admin' | 'employee' | 'super_admin' | null => {
  const role = localStorage.getItem('userRole');
  if (role === 'admin' || role === 'employee' || role === 'super_admin') {
    return role;
  }
  return null;
};

/**
 * Checks if user is super admin
 */
export const isSuperAdmin = (): boolean => {
  return getCurrentUserRole() === 'super_admin';
};
