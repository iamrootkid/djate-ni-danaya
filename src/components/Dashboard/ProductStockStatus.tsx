import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useShopData } from "@/hooks/use-shop-data";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";

interface ProductStockStatusProps {
  limit?: number;
}

export const ProductStockStatus = ({ limit = 5 }: ProductStockStatusProps) => {
  const { useShopQuery } = useShopData();

  const { data: rawProducts, isLoading } = useShopQuery(
    ["products-stock"],
    "products",
    {
      select: "id, name, stock, stock_quantity, price",
      enabled: true,
    }
  );

  const products = Array.isArray(rawProducts)
    ? rawProducts.filter(
        (item) =>
          item &&
          typeof item === "object" &&
          !("code" in item) &&
          typeof item.id === "string" &&
          typeof item.name === "string"
      )
    : [];

  const getStockStatus = (stock: number) => {
    if (stock <= 0) {
      return <Badge variant="destructive">Rupture</Badge>;
    } else if (stock < 10) {
      return <Badge variant="warning">Faible</Badge>;
    } else {
      return <Badge variant="success">En stock</Badge>;
    }
  };

  // Mobile view content
  const MobileContent = () => (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold text-[#222]">Produits à faible stock</h3>
        <div className="flex items-center gap-2">
          <div className="bg-[#f2f2f7] rounded-xl px-2.5 py-1">
            <span className="text-sm font-semibold text-[#222]">
              {products.length} produits en alerte
            </span>
          </div>
          <button className="p-1">
            <RefreshCw className="h-4 w-4 text-[#888]" />
          </button>
        </div>
      </div>
      <div className="flex justify-between border-b border-[#e0e0e0] pb-1.5 mb-2">
        <span className="flex-1 text-sm font-semibold text-[#222]">Produit</span>
        <span className="flex-1 text-sm font-semibold text-[#222]">Stock</span>
        <span className="flex-1 text-sm font-semibold text-[#222]">Statut</span>
      </div>
      {products.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-[#888] text-sm">Aucun produit à afficher</p>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((item) => {
            const stock = typeof item.stock === "number" ? item.stock : typeof item.stock_quantity === "number" ? item.stock_quantity : 0;
            return (
              <div 
                key={item.id} 
                className="flex items-center justify-between py-2"
              >
                <span className="flex-1 text-sm text-[#222] truncate">{item.name}</span>
                <span className="flex-1 text-sm text-[#222]">{stock}</span>
                <span className="flex-1">{getStockStatus(stock)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Desktop view content
  const DesktopContent = () => (
    <Card>
      <CardHeader>
        <CardTitle>Produits à faible stock</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((item) => {
              const stock = typeof item.stock === "number" ? item.stock : typeof item.stock_quantity === "number" ? item.stock_quantity : 0;
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    {typeof item.price === "number"
                      ? item.price.toLocaleString() + " F CFA"
                      : "-"}
                  </TableCell>
                  <TableCell>{stock}</TableCell>
                  <TableCell>{getStockStatus(stock)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="md:hidden bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-7 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-6" />
          </div>
        </div>
        <div className="flex justify-between border-b border-[#e0e0e0] pb-1.5 mb-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
        {Array(limit).fill(0).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="md:hidden bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-[#222]">Produits à faible stock</h3>
          <div className="flex items-center gap-2">
            <div className="bg-[#f2f2f7] rounded-xl px-2.5 py-1">
              <span className="text-sm font-semibold text-[#222]">0 produits en alerte</span>
            </div>
            <button className="p-1">
              <RefreshCw className="h-4 w-4 text-[#888]" />
            </button>
          </div>
        </div>
        <div className="text-center py-6">
          <p className="text-[#888] text-sm">Aucun produit à afficher</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="md:hidden">
        <MobileContent />
      </div>
      <div className="hidden md:block">
        <DesktopContent />
      </div>
    </>
  );
};

export default ProductStockStatus;
