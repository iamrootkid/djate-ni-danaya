
import { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback } from "react";
import { supabase, fixJwtTokenIfNeeded } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { AuthContextType, AuthUser, LoginCredentials, Role } from "@/types/auth";
import { hasPermission, isValidRole } from "@/utils/roleManagement";
import { safeGetProfileData } from "@/utils/supabaseHelpers";

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  login: async () => {},
  logout: async () => {},
  checkPermission: () => false,
});

// Rate limiter for auth operations
const rateLimits: Record<string, number> = {};

const shouldRateLimit = (operation: string, timeWindow = 2000): boolean => {
  const now = Date.now();
  const lastCall = rateLimits[operation] || 0;
  
  if (now - lastCall < timeWindow) {
    return true;
  }
  
  rateLimits[operation] = now;
  return false;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const processingAuthChange = useRef(false);

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

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // This is only called once during initialization
        await fixJwtTokenIfNeeded();

        // Set up the auth state change listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            // Avoid processing while another auth change is in progress
            if (processingAuthChange.current) {
              console.log('Auth change already in progress, skipping');
              return;
            }
            
            processingAuthChange.current = true;
            console.log('Auth state changed:', event);
            
            // Use setTimeout to prevent potential deadlocks with Supabase client
            setTimeout(async () => {
              try {
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                  await updateUserState(session);
                } else if (event === 'SIGNED_OUT') {
                  setUser(null);
                  setIsAuthenticated(false);
                  setError(null);
                }
              } finally {
                processingAuthChange.current = false;
              }
            }, 0);
          }
        );

        // Then get the current session
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
  }, [updateUserState]);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);

      if (shouldRateLimit('login')) {
        throw new Error('Too many login attempts. Please try again later.');
      }

      // Clear any existing sessions
      await supabase.auth.signOut();

      // Authenticate
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) throw authError;

      // Handle remember me
      if (credentials.rememberMe) {
        localStorage.setItem('rememberedEmail', credentials.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // Wait for user state update via auth change listener
      // This avoids duplicating state update logic

      // Verify shop access
      if (authData.user && credentials.shopId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('shop_id')
          .eq('id', authData.user.id)
          .single();
          
        if (profile?.shop_id !== credentials.shopId) {
          await logout();
          throw new Error('User does not have access to this shop');
        }
      }

      toast.success('Logged in successfully');
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

      if (shouldRateLimit('logout')) {
        throw new Error('Please wait before logging out again');
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Cleanup will happen via auth state change listener
      localStorage.removeItem('shopId');
      localStorage.removeItem(SHOP_CACHE_KEY);
      toast.success('Logged out successfully');
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

// This const isn't defined elsewhere, so we need to define it here
const SHOP_CACHE_KEY = 'shop_id_cache';
