
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useShopId } from "@/hooks/use-shop-id";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { isQueryError, safeGet } from "@/utils/safeFilters";

export const InventoryReport = () => {
  const { shopId } = useShopId();
  
  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ["inventory", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      
      // Type casting to any to avoid type issues with Supabase response
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq("shop_id", shopId as any) as any;
        
      if (error) throw error;
      
      // Filter out any error objects that might be in the data
      return data ? data.filter((item: any) => !isQueryError(item)) : [];
    },
    enabled: !!shopId
  });

  const formattedData = inventoryData?.map(item => {
    if (isQueryError(item)) {
      return { name: 'Error', stock: 0, category: 'Unknown' };
    }
    
    return {
      name: safeGet(item, 'name', 'Unknown'),
      stock: safeGet(item, 'stock', 0),
      category: safeGet(item, ['categories', 'name'], 'Uncategorized')
    };
  }) || [];

  const getCategoryColors = () => {
    const categories = [...new Set(formattedData.map(item => item.category) || [])];
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];
    
    return categories.reduce((acc, category, index) => {
      if (category) acc[category] = colors[index % colors.length];
      return acc;
    }, {} as Record<string, string>);
  };

  const categoryColors = getCategoryColors();

  return (
    <Card>
      <CardHeader>
        <CardTitle>État des stocks</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-6">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : inventoryData && inventoryData.length > 0 ? (
          <div className="w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={formattedData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name, props) => [`${value} unités`, 'Stock']}
                  labelFormatter={(label) => `Produit: ${label}`}
                />
                <Legend />
                <Bar 
                  dataKey="stock" 
                  name="Quantité en stock" 
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex justify-center items-center h-40">
            <p className="text-muted-foreground text-center">
              Aucun produit trouvé. Ajoutez des produits pour voir les données d'inventaire.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
