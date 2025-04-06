
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBestSellingProducts } from "@/hooks/use-best-selling-products";
import { BestSellingProduct } from "@/integrations/supabase/types/functions";
import { DateFilter } from "@/types/invoice";
import { Skeleton } from "@/components/ui/skeleton";

interface BestSellingProductsProps {
  dateFilter: DateFilter;
  startDate: Date;
}

export const BestSellingProducts = ({ dateFilter, startDate }: BestSellingProductsProps) => {
  const { data: topProducts, isLoading, error } = useBestSellingProducts(dateFilter, startDate);
  
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Produits les plus vendus</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead>Ventes totales</TableHead>
              <TableHead>Revenus</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4 text-red-500">
                  Erreur: {error instanceof Error ? error.message : "Une erreur s'est produite"}
                </TableCell>
              </TableRow>
            ) : Array.isArray(topProducts) && topProducts.length > 0 ? (
              topProducts.map((product: BestSellingProduct) => (
                <TableRow key={product.product_id}>
                  <TableCell>{product.product_name}</TableCell>
                  <TableCell>{product.total_quantity}</TableCell>
                  <TableCell>{product.total_revenue.toLocaleString()} F CFA</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  Aucun produit vendu pour le moment
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
