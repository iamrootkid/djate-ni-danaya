
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Store, Users, DollarSign } from "lucide-react";

interface ShopStats {
  id: string;
  name: string;
  address: string;
  pin_code: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
  total_sales: number;
  total_revenue: number;
}

export const GlobalStats = () => {
  const { data: shopsData, isLoading } = useQuery({
    queryKey: ['super-admin-shops'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_all_shops');
      if (error) throw error;
      return data as ShopStats[];
    },
  });

  const totalShops = shopsData?.length || 0;
  const totalRevenue = shopsData?.reduce((sum, shop) => sum + Number(shop.total_revenue), 0) || 0;
  const totalSales = shopsData?.reduce((sum, shop) => sum + Number(shop.total_sales), 0) || 0;
  const averageRevenuePerShop = totalShops > 0 ? totalRevenue / totalShops : 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Magasins</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShops}</div>
            <p className="text-xs text-muted-foreground">
              Magasins actifs dans le système
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus Totaux</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} FCFA</div>
            <p className="text-xs text-muted-foreground">
              Tous magasins confondus
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventes Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
            <p className="text-xs text-muted-foreground">
              Nombre total de ventes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu Moyen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRevenuePerShop.toLocaleString()} FCFA</div>
            <p className="text-xs text-muted-foreground">
              Par magasin
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance des Magasins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shopsData?.map((shop) => (
              <div key={shop.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{shop.name}</h3>
                  <p className="text-sm text-gray-600">{shop.address || 'Adresse non spécifiée'}</p>
                  <p className="text-xs text-gray-500">PIN: {shop.pin_code}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{Number(shop.total_revenue).toLocaleString()} FCFA</p>
                  <p className="text-sm text-gray-600">{shop.total_sales} ventes</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
