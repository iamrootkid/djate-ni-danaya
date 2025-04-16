
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const useShopId = () => {
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const navigate = useNavigate();

  // Force refresh shop ID from backend rather than cache
  const refreshShopId = async () => {
    try {
      // Check if we should throttle this request (max once per minute)
      const now = Date.now();
      if (now - lastRefreshTime < 60000) {
        console.log("Throttling shop ID refresh to avoid rate limits");
        // Return the cached value from local storage if available
        const cachedShopId = localStorage.getItem("shopId");
        return cachedShopId;
      }

      setLastRefreshTime(now);
      
      if (!user) {
        console.log("No authenticated user, returning null for shopId");
        return null;
      }

      console.log("Refreshing shop ID for user:", user.id);
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("shop_id")
        .eq("id", user.id)
        .maybeSingle(); // Using maybeSingle instead of single to avoid errors

      if (error) {
        console.error("Error fetching shop ID:", error);
        if (error.code === "406" || error.code === "429") {
          toast.error("Erreur de connexion au serveur. Veuillez vous reconnecter.");
          await supabase.auth.signOut();
          navigate("/login");
          return null;
        }
        return null;
      }
      
      if (!profile?.shop_id) {
        console.warn("User has no associated shop ID");
        return null;
      }
      
      // Update local storage with current shop ID
      console.log("Setting shop ID in localStorage:", profile.shop_id);
      localStorage.setItem("shopId", profile.shop_id);
      return profile.shop_id;
    } catch (error) {
      console.error("Error in refreshShopId:", error);
      return null;
    }
  };

  useEffect(() => {
    if (authLoading) {
      return; // Wait until auth state is settled
    }

    if (!user) {
      console.log("No authenticated user, not setting up shop ID refresh");
      return;
    }

    // Initial refresh when component mounts
    refreshShopId().then(shopId => {
      if (shopId) {
        queryClient.setQueryData(["shop-id"], shopId);
      }
    });

    // Set up PostgreSQL changes listener with error handling
    let retryCount = 0;
    const MAX_RETRIES = 3;
    const setupChannel = () => {
      try {
        const shopId = localStorage.getItem("shopId");
        if (!shopId) return null;

        console.log("Setting up profiles changes subscription for shop:", shopId);
        const channel = supabase
          .channel('shop-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
            (payload) => {
              console.log("Profile change detected:", payload);
              queryClient.invalidateQueries({ queryKey: ['shop-id'] });
              refreshShopId();
            }
          )
          .subscribe((status) => {
            if (status === 'CHANNEL_ERROR' && retryCount < MAX_RETRIES) {
              retryCount++;
              console.log(`Channel error, retrying (${retryCount}/${MAX_RETRIES})...`);
              setTimeout(setupChannel, 2000 * retryCount);
            }
          });
        
        return channel;
      } catch (error) {
        console.error("Error setting up channel:", error);
        return null;
      }
    };

    const channel = setupChannel();

    return () => {
      if (channel) {
        console.log("Removing shop-changes channel");
        supabase.removeChannel(channel);
      }
    };
  }, [queryClient, user, authLoading]);

  const { data: shopId, error } = useQuery({
    queryKey: ["shop-id"],
    queryFn: refreshShopId,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 2,
    retryDelay: 1000,
    enabled: !!user && !authLoading,
  });

  if (error) {
    console.error("Error in shopId query:", error);
  }

  return { shopId, refreshShopId };
};
