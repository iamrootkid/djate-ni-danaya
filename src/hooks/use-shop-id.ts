import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useShopId() {
  const [shopId, setShopId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getShopId() {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('No user found:', userError?.message);
          window.location.href = '/auth/login';
          return;
        }

        // Get user's profile with shop_id
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('shop_id')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError.message);
          return;
        }

        if (!profile?.shop_id) {
          console.error('No shop ID found, user should be redirected to login');
          window.location.href = '/auth/login';
          return;
        }

        setShopId(profile.shop_id);
      } catch (error) {
        console.error('Error in getShopId:', error);
      } finally {
        setIsLoading(false);
      }
    }

    getShopId();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setShopId(null);
        window.location.href = '/auth/login';
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { shopId, isLoading };
} 