
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { safeGetProfileData } from "@/utils/supabaseHelpers";

// Create a cache for shop IDs to reduce redundant fetches
type ShopCache = {
  id: string | null;
  timestamp: number;
}

const SHOP_CACHE_KEY = 'shop_id_cache';
const CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes

export const useShopId = () => {
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const navigate = useNavigate();
  
  // Try to load the shop ID from cache first
  useEffect(() => {
    try {
      const cachedData = localStorage.getItem(SHOP_CACHE_KEY);
      if (cachedData) {
        const cache: ShopCache = JSON.parse(cachedData);
        if (Date.now() - cache.timestamp < CACHE_EXPIRY && cache.id) {
          // Cache is valid, set the data in the query cache
          queryClient.setQueryData(["shop-id"], cache.id);
        }
      }
    } catch (e) {
      console.error("Error loading cached shop ID:", e);
      localStorage.removeItem(SHOP_CACHE_KEY);
    }
  }, [queryClient]);

  // Force refresh shop ID from backend rather than cache
  const refreshShopId = useCallback(async () => {
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
      
      // Safely execute the query
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("shop_id")
          .eq("id", user.id)
          .maybeSingle();

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
        
        // Update local storage with current shop ID and cache
        console.log("Setting shop ID in localStorage:", profile.shop_id);
        localStorage.setItem("shopId", profile.shop_id);
        
        // Update the cache
        const cacheData: ShopCache = {
          id: profile.shop_id,
          timestamp: Date.now()
        };
        localStorage.setItem(SHOP_CACHE_KEY, JSON.stringify(cacheData));
        
        return profile.shop_id;
      } catch (error) {
        console.error("Error in shop ID query:", error);
        return null;
      }
    } catch (error) {
      console.error("Error in refreshShopId:", error);
      return null;
    }
  }, [user, lastRefreshTime, navigate]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      console.log("No authenticated user, not setting up shop ID refresh");
      return;
    }

    let isSubscribed = true;

    // Initial refresh when component mounts
    const initializeShopId = async () => {
      if (!isSubscribed) return;
      
      const shopId = await refreshShopId();
      if (shopId && isSubscribed) {
        queryClient.setQueryData(["shop-id"], shopId);
      }
    };

    initializeShopId();

    // Set up PostgreSQL changes listener with error handling
    let retryCount = 0;
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000;
    
    const setupChannel = () => {
      if (!isSubscribed) return null;
      
      try {
        const shopId = localStorage.getItem("shopId");
        if (!shopId) return null;

        console.log("Setting up profiles changes subscription for shop:", shopId);
        
        // Reduce realtime events to prevent rate limiting
        const channel = supabase
          .channel('shop-changes')
          .on(
            'postgres_changes',
            { 
              event: '*', 
              schema: 'public', 
              table: 'profiles', 
              filter: `id=eq.${user.id}` 
            },
            (payload) => {
              // Use setTimeout to delay processing the event
              setTimeout(() => {
                console.log("Profile change detected:", payload);
                queryClient.invalidateQueries({ queryKey: ['shop-id'] });
                refreshShopId();
              }, 500);
            }
          )
          .subscribe((status) => {
            if (status === 'CHANNEL_ERROR' && retryCount < MAX_RETRIES) {
              retryCount++;
              console.log(`Channel error, retrying (${retryCount}/${MAX_RETRIES})...`);
              setTimeout(setupChannel, RETRY_DELAY * retryCount);
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
      isSubscribed = false;
      if (channel) {
        console.log("Removing shop-changes channel");
        supabase.removeChannel(channel);
      }
    };
  }, [queryClient, user, authLoading, refreshShopId]);

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
