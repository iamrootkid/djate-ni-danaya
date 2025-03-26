import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RecentOrder {
  id: string;
  product: string;
  status: string;
  total: string;
}

interface SaleItem {
  quantity: number;
  products: {
    name: string;
  };
}

interface SaleData {
  id: string;
  total_amount: number;
  status: string;
  sale_items: SaleItem[];
}

export const useRecentOrders = (dateFilter: "all" | "daily" | "monthly", startDate: Date) => {
  const shopId = localStorage.getItem("shopId");

  return useQuery<RecentOrder[]>({
    queryKey: ["recent-orders", dateFilter, startDate, shopId],
    queryFn: async () => {
      if (!shopId) return [];

      let query = supabase
        .from("sales")
        .select(`
          id,
          total_amount,
          status,
          sale_items (
            quantity,
            products (
              name
            )
          )
        `)
        .eq("shop_id", shopId);

      if (dateFilter === "daily") {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(startDate);
        end.setHours(23, 59, 59, 999);
        query = query
          .gte("created_at", start.toISOString())
          .lte("created_at", end.toISOString());
      } else if (dateFilter === "monthly") {
        const monthStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const monthEnd = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59, 999);
        query = query
          .gte("created_at", monthStart.toISOString())
          .lte("created_at", monthEnd.toISOString());
      }

      const { data, error } = await query.order("created_at", { ascending: false }).limit(5);

      if (error) {
        console.error("Error fetching recent orders:", error);
        throw error;
      }

      if (!data) return [];

      const typedData = data as unknown as Array<{
        id: string;
        total_amount: number;
        status: string;
        sale_items: Array<{
          quantity: number;
          products: {
            name: string;
          };
        }>;
      }>;
      
      return typedData.map(sale => ({
        id: sale.id,
        product: sale.sale_items?.[0]?.products?.name || "Unknown Product",
        status: sale.status,
        total: `${sale.total_amount.toLocaleString()} F CFA`
      }));
    },
    enabled: !!shopId,
  });
};
