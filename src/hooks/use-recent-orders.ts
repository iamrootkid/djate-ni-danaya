
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays } from "date-fns";
import { useShopId } from "./use-shop-id";
import { DateFilter } from "@/types/invoice";

interface RecentOrder {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  sale_items: Array<{
    quantity: number;
    products: {
      name: string;
    };
  }>;
}

export const useRecentOrders = (dateFilter: DateFilter, startDate: Date) => {
  const { shopId } = useShopId();

  return useQuery<RecentOrder[]>({
    queryKey: ["recent-orders", dateFilter, startDate, shopId],
    queryFn: async () => {
      if (!shopId) {
        console.error("No shop ID available for fetching recent orders");
        return [];
      }

      // Verify the current user has access to this shop
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user found");
        return [];
      }

      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("shop_id")
        .eq("id", user.id)
        .single();

      if (profileError || !userProfile || userProfile.shop_id !== shopId) {
        console.error("User does not have access to this shop:", {
          userId: user.id,
          shopId,
          profileShopId: userProfile?.shop_id
        });
        return [];
      }

      console.log("Fetching recent orders for verified shop:", shopId, "with filter:", dateFilter);

      let query = supabase
        .from("sales")
        .select(`
          id,
          total_amount,
          created_at,
          sale_items (
            quantity,
            products (
              name
            )
          )
        `)
        .eq("shop_id", shopId);

      // Apply date filtering
      if (dateFilter === "daily") {
        const dayStart = startOfDay(startDate);
        const dayEnd = endOfDay(startDate);
        query = query
          .gte("created_at", dayStart.toISOString())
          .lte("created_at", dayEnd.toISOString());
      } else if (dateFilter === "yesterday") {
        const yesterday = subDays(startDate, 1);
        const dayStart = startOfDay(yesterday);
        const dayEnd = endOfDay(yesterday);
        query = query
          .gte("created_at", dayStart.toISOString())
          .lte("created_at", dayEnd.toISOString());
      } else if (dateFilter === "monthly") {
        const monthStart = startOfMonth(startDate);
        const monthEnd = endOfMonth(startDate);
        console.log("Monthly filter dates:", {
          start: monthStart.toISOString(),
          end: monthEnd.toISOString()
        });
        query = query
          .gte("created_at", monthStart.toISOString())
          .lte("created_at", monthEnd.toISOString());
      }

      // Order by creation date and limit to 5 most recent
      query = query.order("created_at", { ascending: false }).limit(5);

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching recent orders:", error);
        return [];
      }

      if (!data) return [];

      console.log("Fetched orders count:", data.length);

      // Transform the data to match the RecentOrder interface
      return data.map(order => ({
        id: order.id,
        total_amount: order.total_amount,
        status: "completed", // Default status since it's not in the database
        created_at: order.created_at,
        sale_items: order.sale_items || []
      }));
    },
    enabled: !!shopId,
  });
};
