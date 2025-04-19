import { createContext, useContext, useEffect, useState, ReactNode } from "react";
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [authChangeProcessing, setAuthChangeProcessing] = useState(false);

  const updateUserState = async (session: Session | null) => {
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
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await fixJwtTokenIfNeeded();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (authChangeProcessing) return;
            setAuthChangeProcessing(true);
            
            console.log('Auth state changed:', event);
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              await updateUserState(session);
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
              setIsAuthenticated(false);
              setError(null);
            }
            
            setAuthChangeProcessing(false);
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
  }, []);

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

      // Update user state
      await updateUserState(authData.session);

      // Verify shop access
      if (user?.shopId !== credentials.shopId) {
        await logout();
        throw new Error('User does not have access to this shop');
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

      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('shopId');
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
