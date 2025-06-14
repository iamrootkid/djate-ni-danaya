
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Store, Users, TrendingUp, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/utils/currency";

export const SystemOverview = () => {
  const { data: shopsData } = useQuery({
    queryKey: ['super-admin-shops'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_all_shops');
      if (error) throw error;
      return data;
    },
  });

  const { data: usersData } = useQuery({
    queryKey: ['super-admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_all_users_with_shops');
      if (error) throw error;
      return data;
    },
  });

  const totalShops = shopsData?.length || 0;
  const totalUsers = usersData?.length || 0;
  const totalRevenue = shopsData?.reduce((sum, shop) => sum + (shop.total_revenue || 0), 0) || 0;
  const totalSales = shopsData?.reduce((sum, shop) => sum + (shop.total_sales || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Magasins</CardTitle>
            <Store className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShops}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires total</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ventes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Magasins par performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shopsData?.slice(0, 5).map((shop) => (
              <div key={shop.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{shop.name}</div>
                  <div className="text-sm text-gray-600">PIN: {shop.pin_code}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(shop.total_revenue || 0)}</div>
                  <div className="text-sm text-gray-600">{shop.total_sales} ventes</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
