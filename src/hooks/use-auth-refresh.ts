
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

/**
 * Custom hook to handle authentication session refresh and errors
 * Helps prevent excessive token refresh requests
 */
export const useAuthRefresh = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Track refresh attempts to prevent excessive requests
    let refreshAttempts = 0;
    const maxRefreshAttempts = 3;
    
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No active session found");
          setIsAuthenticated(false);
          navigate('/login');
          return;
        }
        
        setIsAuthenticated(true);
      } catch (error: any) {
        console.error("Session check error:", error.message);
        
        // If we detect an expired token error
        if (error.message?.includes('JWT') || error.message?.includes('token')) {
          if (refreshAttempts < maxRefreshAttempts) {
            refreshAttempts++;
            console.log(`Attempting to refresh session (${refreshAttempts}/${maxRefreshAttempts})`);
            
            // Add delay between attempts
            setTimeout(async () => {
              try {
                const { error: refreshError } = await supabase.auth.refreshSession();
                
                if (refreshError) {
                  console.error("Failed to refresh session:", refreshError);
                  toast.error("Your session has expired. Please sign in again.");
                  navigate('/login');
                }
              } catch (refreshException) {
                console.error("Session refresh exception:", refreshException);
                navigate('/login');
              }
            }, refreshAttempts * 1000); // Exponential backoff
          } else {
            console.error("Max refresh attempts reached");
            toast.error("Authentication error. Please sign in again.");
            supabase.auth.signOut();
            navigate('/login');
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Check session on mount
    checkSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
        // Reset refresh attempts counter on successful sign in
        refreshAttempts = 0;
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        navigate('/login');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
        refreshAttempts = 0;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return { isLoading, isAuthenticated };
};
