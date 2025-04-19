
import { createContext, useContext, useEffect, useRef, ReactNode } from "react";
import { supabase, fixJwtTokenIfNeeded } from "@/integrations/supabase/client";
import { AuthContextType, LoginCredentials } from "@/types/auth";
import { hasPermission } from "@/utils/roleManagement";
import { useAuthState } from "@/hooks/use-auth-state";
import { handleLogin, handleLogout } from "@/utils/authActions";

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  login: async () => {},
  logout: async () => {},
  checkPermission: () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    user,
    isAuthenticated,
    loading,
    error,
    setLoading,
    setError,
    updateUserState,
  } = useAuthState();
  const processingAuthChange = useRef(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await fixJwtTokenIfNeeded();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (processingAuthChange.current) {
              console.log('Auth change already in progress, skipping');
              return;
            }
            
            processingAuthChange.current = true;
            console.log('Auth state changed:', event);
            
            setTimeout(async () => {
              try {
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                  await updateUserState(session);
                } else if (event === 'SIGNED_OUT') {
                  await updateUserState(null);
                }
              } finally {
                processingAuthChange.current = false;
              }
            }, 0);
          }
        );

        const { data: { session } } = await supabase.auth.getSession();
        await updateUserState(session);
        setLoading(false);

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize auth'));
        setLoading(false);
      }
    };

    initializeAuth();
  }, [updateUserState, setLoading, setError]);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      await handleLogin(credentials);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err : new Error('Failed to login'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await handleLogout();
    } catch (err) {
      console.error('Logout error:', err);
      setError(err instanceof Error ? err : new Error('Failed to logout'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkPermission = (permission: string): boolean => {
    return user ? hasPermission(user.role, permission) : false;
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        loading, 
        error, 
        login, 
        logout,
        checkPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
