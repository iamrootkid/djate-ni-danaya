
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useInventoryReport } from "@/hooks/use-inventory-report";
import { isQueryError } from "@/utils/safeFilters";
import { formatCurrency } from "@/utils/currency";

interface ProductWithCategory {
  id: string;
  name: string;
  stock: number;
  price: number;
  categories?: { name: string } | null;
}

export const InventoryReport: React.FC = () => {
  const { data: productsData, isLoading, isError } = useInventoryReport();
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rapport d'inventaire</CardTitle>
        </CardHeader>
        <CardContent>Chargement des données d'inventaire...</CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rapport d'inventaire</CardTitle>
        </CardHeader>
        <CardContent>Erreur lors du chargement des données d'inventaire.</CardContent>
      </Card>
    );
  }

  // Filter out any error objects and transform valid products
  const safeProducts = (productsData || []).filter((p): p is ProductWithCategory => {
    return p !== null && typeof p === "object" && "id" in p && !isQueryError(p);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rapport d'inventaire</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom du produit</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {safeProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
