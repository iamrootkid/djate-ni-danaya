
import { useState, useCallback } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthUser } from "@/types/auth";
import { isValidRole } from "@/utils/roleManagement";
import { safeGetProfileData } from "@/utils/supabaseHelpers";

export const useAuthState = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const updateUserState = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      setUser(null);
      setIsAuthenticated(false);
      return;
    }

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, shop_id')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      const role = safeGetProfileData(profile, 'role', 'employee');
      if (!isValidRole(role)) {
        throw new Error('Invalid role in user profile');
      }

      const authUser: AuthUser = {
        id: session.user.id,
        email: session.user.email!,
        role: role,
        shopId: profile.shop_id,
      };

      setUser(authUser);
      setIsAuthenticated(true);
      setError(null);
    } catch (err) {
      console.error('Error updating user state:', err);
      setError(err instanceof Error ? err : new Error('Failed to update user state'));
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    setLoading,
    setError,
    updateUserState,
  };
};
