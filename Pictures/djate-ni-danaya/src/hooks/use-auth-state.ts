
import { useState, useCallback } from "react";
import { Session } from "@supabase/supabase-js";
import { AuthUser } from "@/types/auth";
import { getUserFromSession } from "./auth/session-manager";
import { updateAuthState, AuthStateManager } from "./auth/auth-state-manager";
import { getErrorMessage } from "@/components/auth/utils/authErrorUtils";

export const useAuthState = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const updateUserState = useCallback(async (session: Session | null) => {
    try {
      const user = await getUserFromSession(session);
      const stateManager: AuthStateManager = {
        setUser,
        setIsAuthenticated,
        setError
      };
      updateAuthState(stateManager, user);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      const error = new Error(errorMessage);
      const stateManager: AuthStateManager = {
        setUser,
        setIsAuthenticated,
        setError
      };
      updateAuthState(stateManager, null, error);
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
