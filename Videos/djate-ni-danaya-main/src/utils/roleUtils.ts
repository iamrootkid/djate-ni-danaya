import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if the current user has the specified role
 * @param requiredRole The role to check for
 * @returns Promise<boolean> True if the user has the role, false otherwise
 */
export const checkUserRole = async (requiredRole: 'admin' | 'employee'): Promise<boolean> => {
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

    return (profile.role as any) === requiredRole;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
};

/**
 * Gets the current user's role from localStorage
 * @returns 'admin' | 'employee' | null The user's role or null if not found
 */
export const getCurrentUserRole = (): 'admin' | 'employee' | null => {
  const role = localStorage.getItem('userRole');
  if (role === 'admin' || role === 'employee') {
    return role;
  }
  return null;
};
