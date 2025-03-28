import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Trash2 } from "lucide-react";
import { CartItem } from "@/types/sales";

interface CartSummaryProps {
  cart: CartItem[];
  updateQuantity: (productId: string, change: number) => void;
  removeFromCart: (productId: string) => void;
}

export const CartSummary = ({ cart, updateQuantity, removeFromCart }: CartSummaryProps) => {
  const handleQuantityChange = (productId: string, change: number, currentQuantity: number) => {
    if (currentQuantity + change <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, change);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Produit</TableHead>
          <TableHead>Quantité</TableHead>
          <TableHead>Prix</TableHead>
          <TableHead>Total</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cart.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleQuantityChange(item.id, -1, item.quantity)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span>{item.quantity}</span>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleQuantityChange(item.id, 1, item.quantity)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
            <TableCell>{item.price.toLocaleString()} F CFA</TableCell>
            <TableCell>{(item.price * item.quantity).toLocaleString()} F CFA</TableCell>
            <TableCell>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeFromCart(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};