
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { useSalesReport } from "@/hooks/use-sales-report";
import { useBestSellingProducts } from "@/hooks/use-best-selling-products";
import { DateRange } from "react-day-picker";
import { useIsMobile } from "@/hooks/use-mobile";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface SalesReportProps {
  dateRange: DateRange;
}

export const SalesReport = ({ dateRange }: SalesReportProps) => {
  const { data: salesData, isLoading: salesLoading } = useSalesReport(dateRange);
  const { data: bestSellingProducts, isLoading: productsLoading } = useBestSellingProducts(dateRange);
  const isMobile = useIsMobile();

  // Process sales data for the chart with safe type handling
  const chartData = salesData?.map(sale => {
    if (!sale) return null;
    return {
      created_at: new Date(sale.created_at).toLocaleDateString(),
      total_amount: sale.total_amount || 0
    };
  }).filter(Boolean) || [];

  return (
    <>
      {isMobile ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Résumé des ventes</CardTitle>
            </CardHeader>
            <CardContent>
              {salesLoading ? (
                <div className="flex justify-center items-center h-24">Chargement...</div>
              ) : !chartData || !Array.isArray(chartData) || chartData.length === 0 ? (
                <div className="flex justify-center items-center h-24">Aucune donnée de vente disponible</div>
              ) : (
                <div className="space-y-3">
                  {chartData.map((item, idx) => (
                    <div key={idx} className="bg-white dark:bg-[#18181b] rounded-xl p-3 border border-border shadow-sm flex justify-between items-center">
                      <div>
                        <div className="text-sm text-muted-foreground">Date</div>
                        <div className="font-bold text-foreground">{item.created_at}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Montant</div>
                        <div className="font-semibold text-[#22c55e]">{item.total_amount.toLocaleString()} F CFA</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Meilleurs produits</CardTitle>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="flex justify-center items-center h-24">Chargement...</div>
              ) : !bestSellingProducts || !Array.isArray(bestSellingProducts) || bestSellingProducts.length === 0 ? (
                <div className="flex justify-center items-center h-24">Aucun produit vendu pour le moment</div>
              ) : (
                <div className="space-y-2">
                  {bestSellingProducts.slice(0, 5).map((prod, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white dark:bg-[#18181b] rounded-xl p-3 border border-border shadow-sm">
                      <div className="font-medium text-foreground">{prod.product_name}</div>
                      <div className="text-sm text-muted-foreground">{prod.total_quantity} vendus</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Aperçu des ventes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                {salesLoading ? (
                  <div className="flex justify-center items-center h-[300px]">Chargement...</div>
                ) : !chartData || !Array.isArray(chartData) || chartData.length === 0 ? (
                  <div className="flex justify-center items-center h-[300px]">Aucune donnée de vente disponible</div>
                ) : (
                  <BarChart
                    width={600}
                    height={300}
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="created_at" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${Number(value).toLocaleString()} F CFA`} />
                    <Legend />
                    <Bar dataKey="total_amount" fill="#8884d8" name="Montant total" />
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
      )}
    </>
  );
};
