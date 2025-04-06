
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/sales";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

interface ProductListProps {
  products: Product[];
  addToCart: (product: Product) => void;
  categoryName?: string | null;
}

export const ProductList = ({ products, addToCart, categoryName }: ProductListProps) => {
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Rupture de stock", variant: "destructive" as const };
    if (stock < 5) return { label: "Stock bas", variant: "warning" as const };
    return { label: "En stock", variant: "success" as const };
  };

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-muted-foreground mb-2">Aucun produit trouvé</div>
        {categoryName && <Badge variant="outline">{categoryName}</Badge>}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Prix</TableHead>
          <TableHead>État du stock</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products?.map((product) => {
          const stockStatus = getStockStatus(product.stock);
          return (
            <TableRow key={product.id}>
              <TableCell className="font-medium">
                {product.name}
                <span className="ml-2 text-sm text-muted-foreground">
                  ({product.stock} en stock)
                </span>
              </TableCell>
              <TableCell>{product.price.toLocaleString()} F CFA</TableCell>
              <TableCell>
                <Badge variant={stockStatus.variant}>
                  {stockStatus.label}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addToCart(product)}
                  disabled={product.stock <= 0}
                  className="hover:bg-primary/10"
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
