import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { useShopId } from "@/hooks/use-shop-id";

export const SalesStats = () => {
  const isMobile = useIsMobile();
  const { shopId } = useShopId();
  
  // Get today's sales stats
  const { data: stats } = useQuery({
    queryKey: ["sales-daily-stats", shopId],
    queryFn: async () => {
      if (!shopId) return {
        totalSales: 0,
        totalTransactions: 0,
        availableProducts: 0,
        customersToday: 0,
        averageSale: 0
      };

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);
      
      // Get today's sales for this shop
      const { data: todaySales, error: salesError } = await supabase
        .from("sales")
        .select("total_amount")
        .eq("shop_id", shopId)
        .gte("created_at", today.toISOString())
        .lte("created_at", todayEnd.toISOString());

      if (salesError) throw salesError;
      
      const totalSales = todaySales.reduce(
        (sum, sale) => sum + (sale.total_amount || 0), 
        0
      );
      
      // Get total transactions today
      const totalTransactions = todaySales.length;
      
      // Get available products for this shop
      const { count: availableProducts, error: productsError } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("shop_id", shopId)
        .gt("stock", 0);
        
      if (productsError) throw productsError;
      
      // Get unique customers today for this shop
      const { count: customersToday, error: customersError } = await supabase
        .from("invoices")
        .select("*", { count: "exact", head: true })
        .eq("shop_id", shopId)
        .gte("created_at", today.toISOString())
        .lte("created_at", todayEnd.toISOString());
        
      if (customersError) throw customersError;
      
      return {
        totalSales,
        totalTransactions,
        availableProducts: availableProducts || 0,
        customersToday: customersToday || 0,
        averageSale: totalTransactions > 0 ? totalSales / totalTransactions : 0
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: !!shopId
  });
  
  // Format numbers with appropriate spacing
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",").replace(/,/g, " ");
  };

  return (
    <div className={`grid grid-cols-2 ${isMobile ? 'gap-2 mb-4' : 'md:grid-cols-4 gap-4 mb-6'}`}>
      <Card>
        <CardContent className={`flex items-center ${isMobile ? 'p-2' : 'p-4'}`}>
          <div className={`${isMobile ? 'p-1' : 'p-2'} bg-primary/10 rounded-full mr-2`}>
            <DollarSign className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-primary`} />
          </div>
          <div>
            <p className={`${isMobile ? 'text-[10px]' : 'text-sm'} text-muted-foreground`}>Ventes aujourd'hui</p>
            <h3 className={`${isMobile ? 'text-xs font-bold' : 'text-xl font-semibold'}`}>{formatNumber(stats?.totalSales || 0)} F</h3>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className={`flex items-center ${isMobile ? 'p-2' : 'p-4'}`}>
          <div className={`${isMobile ? 'p-1' : 'p-2'} bg-primary/10 rounded-full mr-2`}>
            <ShoppingCart className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-primary`} />
          </div>
          <div>
            <p className={`${isMobile ? 'text-[10px]' : 'text-sm'} text-muted-foreground`}>Transactions</p>
            <h3 className={`${isMobile ? 'text-xs font-bold' : 'text-xl font-semibold'}`}>{stats?.totalTransactions || 0}</h3>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className={`flex items-center ${isMobile ? 'p-2' : 'p-4'}`}>
          <div className={`${isMobile ? 'p-1' : 'p-2'} bg-primary/10 rounded-full mr-2`}>
            <Package className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-primary`} />
          </div>
          <div>
            <p className={`${isMobile ? 'text-[10px]' : 'text-sm'} text-muted-foreground`}>Produits disponibles</p>
            <h3 className={`${isMobile ? 'text-xs font-bold' : 'text-xl font-semibold'}`}>{stats?.availableProducts || 0}</h3>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className={`flex items-center ${isMobile ? 'p-2' : 'p-4'}`}>
          <div className={`${isMobile ? 'p-1' : 'p-2'} bg-primary/10 rounded-full mr-2`}>
            <Users className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-primary`} />
          </div>
          <div>
            <p className={`${isMobile ? 'text-[10px]' : 'text-sm'} text-muted-foreground`}>Clients aujourd'hui</p>
            <h3 className={`${isMobile ? 'text-xs font-bold' : 'text-xl font-semibold'}`}>{stats?.customersToday || 0}</h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
