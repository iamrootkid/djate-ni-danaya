
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { useShopId } from "@/hooks/use-shop-id";

export const ProductStockStatus = () => {
  const { toast } = useToast();
  const { shopId } = useShopId();
  
  const { data: products, isLoading } = useQuery({
    queryKey: ["products-stock", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("shop_id", shopId)
        .order("stock", { ascending: true })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    enabled: !!shopId,
  });

  useEffect(() => {
    if (!products || products.length === 0) return;
    
    // Create a Set to track products we've already alerted about
    const alertedProducts = new Set();
    
    // Show alerts for all low stock products (≤5)
    products.forEach(product => {
      if (product.stock <= 5 && !alertedProducts.has(product.id)) {
        toast({
          title: "Alerte de stock bas",
          description: `${product.name} est presque épuisé (${product.stock} unités restantes)`,
          variant: "destructive",
        });
        
        // Add to set of alerted products to prevent duplicate alerts
        alertedProducts.add(product.id);
      }
    });
  }, [products, toast]);

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Produits à faible stock</CardTitle>
        <Badge variant="outline">
          {products?.filter(p => p.stock <= 5).length || 0} produits en alerte
        </Badge>
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
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products && products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      {product.stock <= 5 ? (
                        <span className="inline-flex items-center text-red-600">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Stock d'alerte
                        </span>
                      ) : product.stock < 10 ? (
                        <span className="inline-flex items-center text-yellow-600">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Stock bas
                        </span>
                      ) : (
                        <span className="text-green-600">En stock</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
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
