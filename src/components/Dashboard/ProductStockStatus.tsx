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

  // Removed 'order' and fixed props
  const { data: rawProducts, isLoading } = useShopQuery(
    ["products-stock"],
    "products",
    {
      select: "id, name, stock, stock_quantity, price",
      limit,
      enabled: true,
    }
  );

  // Filter out query errors and keep only valid products
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
            ) : products.length > 0 ? (
              products.map((item, idx) => {
                // "stock" is the expected field but check stock_quantity for safety
                const stock =
                  typeof item.stock === "number"
                    ? item.stock
                    : typeof item.stock_quantity === "number"
                    ? item.stock_quantity
                    : 0;

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
