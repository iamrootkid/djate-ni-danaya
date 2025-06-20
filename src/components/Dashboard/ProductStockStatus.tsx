import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useShopId } from "@/hooks/use-shop-id";

type Product = Database['public']['Tables']['products']['Row'];

interface ProductStockStatusProps {
  limit?: number;
}

export const ProductStockStatus = ({ limit = 10 }: ProductStockStatusProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { shopId } = useShopId();

  useEffect(() => {
    const fetchProducts = async () => {
      if (!shopId) {
        console.error("No shop ID available for fetching products");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('shop_id', shopId as any)
          .order('stock', { ascending: true })
          .limit(limit);

        if (error) throw error;
        if (data) {
          setProducts(data as unknown as Product[]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (shopId) {
      fetchProducts();
    }
  }, [limit, shopId]);

  const getStockStatus = (stock: number) => {
    if (stock <= 0) {
      return <Badge variant="destructive">Épuisé</Badge>;
    } else if (stock <= 5) {
      return <Badge variant="warning">Faible</Badge>;
    } else {
      return <Badge variant="success">En stock</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Produits à faible stock</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-card-foreground">Produits à faible stock</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
            {products.length} produits en alerte
          </Badge>
          <Button variant="ghost" size="icon" className="hover:bg-accent hover:text-accent-foreground">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.length === 0 ? (
            <p className="text-center text-muted-foreground">Aucun produit à afficher</p>
          ) : (
            products.map((item) => {
              const stock = typeof item.stock === "number" ? item.stock : 0;
              return (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <span className="text-sm truncate text-card-foreground">{item.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{stock}</span>
                    {getStockStatus(stock)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductStockStatus;
