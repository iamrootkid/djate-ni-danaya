
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useShopId } from "@/hooks/use-shop-id";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { isQueryError, safeQueryResult } from "@/utils/safeFilters";

interface ProductStockItem {
  id: string;
  name: string;
  stock: number;
  price: number;
  category?: string;
}

export function ProductStockStatus() {
  const { shopId } = useShopId();
  const queryClient = useQueryClient();
  
  const { data: products, isLoading, error } = useQuery({
    queryKey: ["products-stock", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          stock,
          price,
          categories (name)
        `)
        .eq('shop_id', shopId)
        .order('stock', { ascending: true })
        .limit(5);
      
      if (error) {
        console.error("Error fetching product stock:", error);
        throw error;
      }
      
      const safeProducts: ProductStockItem[] = [];
      
      if (data) {
        for (const item of data) {
          if (!isQueryError(item)) {
            safeProducts.push({
              id: item.id || "",
              name: item.name || "Unknown Product",
              stock: item.stock || 0,
              price: item.price || 0,
              category: item.categories?.name
            });
          }
        }
      }
      
      return safeProducts;
    },
    enabled: !!shopId
  });
  
  // Set up subscription for real-time updates
  useEffect(() => {
    if (!shopId) return;
    
    const channel = supabase
      .channel('products-stock-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products', filter: `shop_id=eq.${shopId}` },
        () => {
          // Invalidate the products-stock query to trigger a refetch
          queryClient.invalidateQueries({ queryKey: ['products-stock'] });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [shopId, queryClient]);

  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { label: "Rupture", variant: "destructive" };
    if (stock < 5) return { label: "Critique", variant: "warning" };
    if (stock < 10) return { label: "Faible", variant: "attention" };
    return { label: "Normal", variant: "outline" };
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">Stock critique</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-4 text-destructive">
            <AlertCircle className="mr-2 h-4 w-4" />
            <span>Erreur de chargement des données</span>
          </div>
        ) : products && products.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const status = getStockStatus(product.stock);
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.category || "Non catégorisé"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{product.stock}</TableCell>
                    <TableCell className="text-right">
                      <Badge className={cn(
                        status.variant === "destructive" && "bg-destructive text-destructive-foreground",
                        status.variant === "warning" && "bg-yellow-500 text-primary-foreground",
                        status.variant === "attention" && "bg-orange-400 text-primary-foreground",
                        status.variant === "outline" && "bg-background text-foreground border border-input"
                      )}>
                        {status.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center py-6 text-muted-foreground">Aucun produit trouvé</p>
        )}
      </CardContent>
    </Card>
  );
}
