
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { useSalesReport } from "@/hooks/use-sales-report";
import { useBestSellingProducts } from "@/hooks/use-best-selling-products";
import { DateRange } from "react-day-picker";
import { BestSellingProduct } from "@/integrations/supabase/types/functions";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface SalesReportProps {
  dateRange: DateRange;
}

export const SalesReport = ({ dateRange }: SalesReportProps) => {
  const { data: salesData, isLoading: salesLoading } = useSalesReport(dateRange);
  const { data: bestSellingProducts, isLoading: productsLoading } = useBestSellingProducts();
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Aperçu des ventes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            {salesLoading ? (
              <div className="flex justify-center items-center h-[300px]">Chargement...</div>
            ) : !salesData || !Array.isArray(salesData) || salesData.length === 0 ? (
              <div className="flex justify-center items-center h-[300px]">Aucune donnée de vente disponible</div>
            ) : (
              <BarChart
                width={600}
                height={300}
                data={salesData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="created_at" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_amount" fill="#8884d8" name="Total Amount" />
              </BarChart>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meilleurs produits</CardTitle>
        </CardHeader>
        <CardContent>
          {productsLoading ? (
            <div className="flex justify-center items-center h-[400px]">Chargement...</div>
          ) : !bestSellingProducts || !Array.isArray(bestSellingProducts) || bestSellingProducts.length === 0 ? (
            <div className="flex justify-center items-center h-[400px]">Aucun produit vendu pour le moment</div>
          ) : (
            <div className="flex justify-center">
              <PieChart width={400} height={400}>
                <Pie
                  data={bestSellingProducts.slice(0, 5)}
                  cx={200}
                  cy={200}
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total_quantity"
                  nameKey="product_name"
                  label={({ name }) => name}
                >
                  {bestSellingProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
