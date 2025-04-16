
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Store request timestamps to implement throttling
    const requestTimes: number[] = [];
    const MAX_REQUESTS_PER_MINUTE = 5;
    const ONE_MINUTE = 60 * 1000;

    const shouldThrottle = () => {
      const now = Date.now();
      // Remove timestamps older than 1 minute
      while (requestTimes.length > 0 && requestTimes[0] < now - ONE_MINUTE) {
        requestTimes.shift();
      }
      // Check if we've made too many requests in the last minute
      return requestTimes.length >= MAX_REQUESTS_PER_MINUTE;
    };

    const trackRequest = () => {
      requestTimes.push(Date.now());
    };

    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (mounted) {
          console.log("Auth state changed:", event);
          if (newSession) {
            setSession(newSession);
            setUser(newSession.user);
          } else {
            setSession(null);
            setUser(null);
          }
        }
      }
    );

    // THEN check for existing session (with throttling)
    const getInitialSession = async () => {
      try {
        if (shouldThrottle()) {
          console.log("Throttling session check to avoid rate limits");
          setError(new Error("Too many authentication requests. Please try again later."));
          return;
        }

        trackRequest();
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

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
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
