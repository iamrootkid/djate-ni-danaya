
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useShopIdSubscription } from "./use-shop-id-subscription";

export const useShopId = () => {
  const { user } = useAuth();
  const [shopId, setShopId] = useState<string>();
  const [pinCode, setPinCode] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [lastRefresh, setLastRefresh] = useState(0);

  // Use the subscription hook
  useShopIdSubscription(shopId);

  const fetchShopData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    // Rate limiting: prevent too frequent refreshes
    const now = Date.now();
    if (now - lastRefresh < 2000) {
      console.log("Throttling shop ID refresh to avoid rate limits");
      return;
    }

    try {
      setIsLoading(true);
      setError(undefined);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setError("Failed to fetch profile");
        return;
      }

      if (!profile?.shop_id) {
        setError("No shop assigned to user");
        return;
      }

      const { data: shop, error: shopError } = await supabase
        .from('shops')
        .select('pin_code')
        .eq('id', profile.shop_id)
        .single();

      if (shopError) {
        console.error("Error fetching shop:", shopError);
        setError("Failed to fetch shop data");
        return;
      }

      setShopId(profile.shop_id);
      setPinCode(shop.pin_code);
      setLastRefresh(now);

      // Store in localStorage for persistence
      const shopData = {
        id: profile.shop_id,
        pinCode: shop.pin_code
      };
      console.log("Setting shop ID and PIN in localStorage:", shopData);
      localStorage.setItem('shopData', JSON.stringify(shopData));

    } catch (error) {
      console.error("Error in fetchShopData:", error);
      setError("Failed to fetch shop data");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, lastRefresh]);

  // Load from localStorage on mount
  useEffect(() => {
    const storedData = localStorage.getItem('shopData');
    if (storedData) {
      try {
        const { id, pinCode: storedPin } = JSON.parse(storedData);
        setShopId(id);
        setPinCode(storedPin);
      } catch (error) {
        console.error("Error parsing stored shop data:", error);
      }
    }
  }, []);

  // Fetch shop data when user changes
  useEffect(() => {
    fetchShopData();
  }, [fetchShopData]);

  const refreshShopId = useCallback(() => {
    setLastRefresh(0); // Reset throttle
    fetchShopData();
  }, [fetchShopData]);

  return {
    shopId,
    pinCode,
    isLoading,
    error,
    refreshShopId
  };
};
