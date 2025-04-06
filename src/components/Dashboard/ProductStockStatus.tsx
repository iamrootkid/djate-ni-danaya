import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { useShopId } from "@/hooks/use-shop-id";
import { useQueryClient } from "@tanstack/react-query";

export const ProductStockStatus = () => {
  const { toast } = useToast();
  const { shopId } = useShopId();
  const queryClient = useQueryClient();
  
  const { data: products, isLoading } = useQuery({
    queryKey: ["products-stock", shopId],
    queryFn: async () => {
      if (!shopId) return [];
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

      // Process the data to get the last seller's email
      return data.map(product => ({
        ...product,
        last_seller_email: product.sale_items?.[0]?.sales?.employee?.email || 'N/A'
      }));
    },
    enabled: !!shopId,
  });

  // Set up real-time subscription for product stock changes
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
          
          // Invalidate relevant queries
          queryClient.invalidateQueries({ queryKey: ['products-stock'] });
          queryClient.invalidateQueries({ queryKey: ['inventory-report'] });
          queryClient.invalidateQueries({ queryKey: ['stock-summary'] });
          
          // Show notification for low stock
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
                <TableHead>Catégorie</TableHead>
                <TableHead>Dernier vendeur</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products && products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>{product.categories?.name || 'Non catégorisé'}</TableCell>
                    <TableCell>{product.last_seller_email}</TableCell>
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
