import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/sales";
import { Badge } from "@/components/ui/badge";

interface ProductListProps {
  products: Product[];
  addToCart: (product: Product) => void;
}

export const ProductList = ({ products, addToCart }: ProductListProps) => {
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Rupture de stock", variant: "destructive" as const };
    if (stock < 5) return { label: "Stock bas", variant: "warning" as const };
    return { label: "En stock", variant: "success" as const };
  };

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
              <TableCell className="font-medium">{product.name}</TableCell>
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
                  Ajouter au panier
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};