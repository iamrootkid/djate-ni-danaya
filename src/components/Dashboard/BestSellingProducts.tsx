
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBestSellingProducts } from "@/hooks/use-best-selling-products";
import { BestSellingProduct } from "@/integrations/supabase/types/functions";
import { DateFilter } from "@/types/invoice";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface BestSellingProductsProps {
  dateFilter: DateFilter;
  startDate: Date;
}

export const BestSellingProducts = ({ dateFilter, startDate }: BestSellingProductsProps) => {
  const { data: topProducts, isLoading, error, refetch } = useBestSellingProducts(dateFilter, startDate);
  const queryClient = useQueryClient();
  
  // Subscribe to real-time updates for product sales
  useEffect(() => {
    const salesChannel = supabase
      .channel('best-products-sales-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sales' },
        () => {
          console.log('Sales data changed, refreshing best products...');
          queryClient.invalidateQueries({ queryKey: ['bestSellingProducts'] });
        }
      )
      .subscribe();
      
    const saleItemsChannel = supabase
      .channel('best-products-items-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sale_items' },
        () => {
          console.log('Sale items changed, refreshing best products...');
          queryClient.invalidateQueries({ queryKey: ['bestSellingProducts'] });
        }
      )
      .subscribe();

    // Clean up subscriptions when component unmounts
    return () => {
      supabase.removeChannel(salesChannel);
      supabase.removeChannel(saleItemsChannel);
    };
  }, [queryClient]);
  
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
              <>
                <TableRow>
                  <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Skeleton className="h-4 w-[170px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[90px]" /></TableCell>
                </TableRow>
              </>
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
