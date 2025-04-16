
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CartSummary } from "@/components/Sales/CartSummary";
import { CartItem } from "@/types/sales";
import { useIsMobile } from "@/hooks/use-mobile";

interface CartSectionProps {
  cart: CartItem[];
  updateQuantity: (productId: string, change: number) => void;
  removeFromCart: (productId: string) => void;
}

export const CartSection = ({
  cart,
  updateQuantity,
  removeFromCart
}: CartSectionProps) => {
  const isMobile = useIsMobile();

  return (
    <Card>
      <CardHeader className={`${isMobile ? 'py-3 px-4' : ''}`}>
        <CardTitle className={`${isMobile ? 'text-lg' : ''}`}>Panier</CardTitle>
      </CardHeader>
      <CardContent className={`${isMobile ? 'p-3' : ''}`}>
        <CartSummary
          cart={cart}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
        />
      </CardContent>
    </Card>
  );
};
