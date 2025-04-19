
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, AlertCircle, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useShopId } from "@/hooks/use-shop-id";
import { useQueryClient } from "@tanstack/react-query";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { safeGet, filterByUUID } from "@/utils/supabaseHelpers";

interface ProductData {
  id: string;
  name: string;
  stock: number;
  price: number;
  categories: { name: string } | null;
  last_seller_email: string;
}

export const ProductStockStatus = () => {
  const { toast } = useToast();
  const { shopId } = useShopId();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: products, isLoading } = useQuery({
    queryKey: ["products-stock", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      try {
        const { data, error } = await supabase
          .from("products")
          .select(`
            id,
            name,
            stock,
            price,
            categories (
              name
            ),
            sale_items (
              sales (
                employee:profiles!sales_employee_id_fkey (
                  email
                )
              )
            )
          `)
          .eq("shop_id", shopId)
          .order("stock", { ascending: true })
          .limit(5);
        
        if (error) throw error;
        if (!data) return [];

        // Type-safe transformation of data to avoid errors
        const transformedProducts: ProductData[] = [];
        
        for (const item of data) {
          if (!item) continue;
          
          transformedProducts.push({
            id: safeGet(item, ['id'], ''),
            name: safeGet(item, ['name'], ''),
            stock: typeof safeGet(item, ['stock'], 0) === 'number' ? safeGet(item, ['stock'], 0) : 0,
            price: typeof safeGet(item, ['price'], 0) === 'number' ? safeGet(item, ['price'], 0) : 0,
            categories: safeGet(item, ['categories'], null),
            last_seller_email: safeGet(item, ['sale_items', 0, 'sales', 'employee', 'email'], 'N/A')
          });
        }

        return transformedProducts;
      } catch (error) {
        console.error("Error fetching product stock:", error);
        return [];
      }
    },
    enabled: !!shopId,
  });

  useEffect(() => {
    if (!shopId) return;

    const channel = supabase
      .channel('product-stock-updates')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'products',
          filter: `shop_id=eq.${shopId}`
        },
        (payload) => {
          console.log("Product stock change detected:", payload);
          
          queryClient.invalidateQueries({ queryKey: ['products-stock'] });
          queryClient.invalidateQueries({ queryKey: ['inventory-report'] });
          queryClient.invalidateQueries({ queryKey: ['stock-summary'] });
          
          if (payload.eventType === 'UPDATE') {
            const newStock = (payload.new as any).stock;
            const productName = (payload.new as any).name;
            
            if (newStock <= 5) {
              toast({
                title: "Alerte de stock bas",
                description: `${productName} est presque épuisé (${newStock} unités restantes)`,
                variant: "destructive",
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shopId, queryClient, toast]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    queryClient.invalidateQueries({ queryKey: ['products-stock'] });
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Produits à faible stock</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {(products?.filter(p => p.stock <= 5).length || 0)} produits en alerte
          </Badge>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRefresh}
            className={isRefreshing ? "animate-spin" : ""}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products && products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>{product.name}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Dernier vendeur: {product.last_seller_email}</p>
                            <p>Prix: {product.price.toLocaleString()} F CFA</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>{product.categories?.name || 'Non catégorisé'}</TableCell>
                    <TableCell>
                      {product.stock <= 5 ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center text-red-600">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Stock d'alerte
                          </span>
                          <Progress value={(product.stock / 5) * 100} className="h-2 bg-red-100" />
                        </div>
                      ) : product.stock < 10 ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center text-yellow-600">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Stock bas
                          </span>
                          <Progress value={(product.stock / 10) * 100} className="h-2 bg-yellow-100" />
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="text-green-600">En stock</span>
                          <Progress value={100} className="h-2 bg-green-100" />
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    Aucun produit à afficher
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
