import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useShopId } from "@/hooks/use-shop-id";
import { Spinner } from "@/components/ui/spinner";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { shopId, isLoading } = useShopId();
  const currentPath = window.location.pathname;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        window.location.href = '/auth/login';
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!shopId && currentPath !== '/auth/login') {
    window.location.href = '/auth/login';
    return null;
  }

  return <>{children}</>;
}; 