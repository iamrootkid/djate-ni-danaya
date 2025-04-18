
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase, shouldRateLimit } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  error: null,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Session cache to reduce redundant fetches
const SESSION_CACHE_KEY = 'auth_session_cache';
const SESSION_CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize from cached session if available
  useEffect(() => {
    try {
      const cachedSessionData = localStorage.getItem(SESSION_CACHE_KEY);
      if (cachedSessionData) {
        const { data, timestamp } = JSON.parse(cachedSessionData);
        
        // Only use cache if it's not expired
        if (Date.now() - timestamp < SESSION_CACHE_EXPIRY) {
          if (data?.session) {
            setSession(data.session);
            setUser(data.session.user);
          }
        } else {
          // Clear expired cache
          localStorage.removeItem(SESSION_CACHE_KEY);
        }
      }
    } catch (e) {
      console.error("Error loading cached session:", e);
      localStorage.removeItem(SESSION_CACHE_KEY);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (mounted) {
        console.log("Auth state changed:", event);
        
        // Handle session in next tick to avoid blocking the main thread
        setTimeout(() => {
          if (newSession) {
            setSession(newSession);
            setUser(newSession.user);
            
            // Cache the session for quicker access
            try {
              localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({
                data: { session: newSession },
                timestamp: Date.now()
              }));
            } catch (e) {
              console.error("Error caching session:", e);
            }
            
            if (event === 'SIGNED_OUT') {
              toast.success("Déconnecté avec succès");
            } else if (event === 'SIGNED_IN') {
              toast.success("Connecté avec succès");
            }
          } else {
            setSession(null);
            setUser(null);
            localStorage.removeItem(SESSION_CACHE_KEY);
          }
        }, 0);
      }
    });

    // THEN check for existing session (with throttling)
    const getInitialSession = async () => {
      try {
        if (shouldRateLimit('auth-session', 3, 10000)) {
          console.log("Throttling session check to avoid rate limits");
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a second
        }

        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (mounted) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
        }
      } catch (error) {
        console.error("Error getting session:", error);
        if (mounted) {
          setError(error as Error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Only fetch session if we don't have one from cache
    if (!session) {
      getInitialSession();
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [session]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem(SESSION_CACHE_KEY);
      localStorage.removeItem('shopId');
      localStorage.removeItem('userRole');
      
      // Clear any query caches if needed
      window.location.href = '/login'; // Force a clean reload to login
    } catch (error) {
      console.error("Error signing out:", error);
      setError(error as Error);
    }
  };

  const value = {
    session,
    user,
    loading,
    error,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
