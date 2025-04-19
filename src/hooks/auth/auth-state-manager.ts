
import { AuthUser } from "@/types/auth";
import { Dispatch, SetStateAction } from "react";
import { getErrorMessage } from "@/components/auth/utils/authErrorUtils";

export interface AuthStateManager {
  setUser: Dispatch<SetStateAction<AuthUser | null>>;
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<Error | null>>;
}

export function updateAuthState(
  manager: AuthStateManager,
  user: AuthUser | null,
  error: Error | null = null
) {
  if (error) {
    const errorMessage = getErrorMessage(error);
    console.error('Error updating user state:', errorMessage);
    manager.setError(error);
    manager.setUser(null);
    manager.setIsAuthenticated(false);
    return;
  }

  manager.setUser(user);
  manager.setIsAuthenticated(!!user);
  manager.setError(null);
}
