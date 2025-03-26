
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export const InventoryReport = () => {
  const shopId = localStorage.getItem("shopId") || "";

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ["inventory-report", shopId],
    queryFn: async () => {
      if (!shopId) return [];

      const { data, error } = await supabase
        .from("products")
        .select("name, stock, category_id, categories(name)")
        .eq("shop_id", shopId)
        .order("stock", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!shopId
  });

  const formattedData = inventoryData?.map(item => ({
    name: item.name,
    stock: item.stock,
    category: item.categories?.name
  }));

  const getCategoryColors = () => {
    const categories = [...new Set(formattedData?.map(item => item.category))];
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];
    
    return categories.reduce((acc, category, index) => {
      acc[category] = colors[index % colors.length];
      return acc;
    }, {});
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
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
};
