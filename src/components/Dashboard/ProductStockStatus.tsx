import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useShopData } from "@/hooks/use-shop-data";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductStockStatusProps {
  limit?: number;
}

export const ProductStockStatus = ({ limit = 5 }: ProductStockStatusProps) => {
  const { useShopQuery } = useShopData();

  const { data: products, isLoading } = useShopQuery(
    ["products-stock"],
    "products",
    {
      select: "id, name, stock, price, stock_quantity",
      order: "stock_quantity",
      limit,
      enabled: true,
    }
  );

  const getStockStatus = (stock: number) => {
    if (stock <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (stock < 10) {
      return <Badge variant="warning">Low Stock</Badge>;
    } else {
      return <Badge variant="success">In Stock</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Stock Status</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(limit)
                .fill(0)
                .map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[50px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                  </TableRow>
                ))
            ) : products && products.length > 0 ? (
              products.map((item, idx) => {
                if (
                  !item ||
                  typeof item !== "object" ||
                  "code" in item // covers SelectQueryError
                ) {
                  return null;
                }
                
                const stock = item.stock_quantity ?? item.stock ?? 0;
                
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.price?.toLocaleString()} F CFA</TableCell>
                    <TableCell>{stock}</TableCell>
                    <TableCell>{getStockStatus(stock)}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ProductStockStatus;
