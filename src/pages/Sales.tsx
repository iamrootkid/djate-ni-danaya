
import { AppLayout } from "@/components/Layout/AppLayout";
import { ProductSection } from "@/components/Sales/ProductSection";
import { CartSection } from "@/components/Sales/CartSection";
import { SalesHeader } from "@/components/Sales/SalesHeader";
import { CustomerInfoDialog } from "@/components/Sales/CustomerInfoDialog";
import { AccessDeniedAlert } from "@/components/Sales/AccessDeniedAlert";
import { useCart } from "@/hooks/use-cart";
import { useCheckout } from "@/hooks/use-checkout";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSalesPage } from "@/hooks/use-sales-page";
import { useToast } from "@/hooks/use-toast";

const Sales = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    paymentMethod,
    setPaymentMethod,
    showCustomerDialog,
    setShowCustomerDialog,
    userRole,
    products,
    categoryData,
    shopId
  } = useSalesPage();

  const { cart, cartTotal, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();
  const checkoutMutation = useCheckout();

  const handleCheckout = () => {
    setShowCustomerDialog(true);
  };

  const handleCustomerSubmit = async (customerName: string, customerPhone: string) => {
    if (!shopId) {
      toast({
        title: "Erreur",
        description: "Identifiant de magasin manquant",
        variant: "destructive"
      });
      throw new Error("Missing shop ID");
    }
    
    const result = await checkoutMutation.mutateAsync(
      { 
        customerName, 
        customerPhone, 
        cart, 
        cartTotal, 
        paymentMethod,
        shopId 
      },
      {
        onSuccess: () => {
          clearCart();
        },
      }
    );
    return { invoiceNumber: result.invoiceNumber };
  };

  if (userRole === "admin") {
    return (
      <AppLayout>
        <AccessDeniedAlert />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        <SalesHeader 
          cartTotal={cartTotal}
          cartEmpty={cart.length === 0}
          isPending={checkoutMutation.isPending}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          onCheckout={handleCheckout}
        />

        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
          <ProductSection 
            products={products}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            addToCart={addToCart}
            categoryName={categoryData?.name}
            isAdmin={false}
          />

          <CartSection 
            cart={cart}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
          />
        </div>

        <CustomerInfoDialog
          open={showCustomerDialog}
          onClose={() => setShowCustomerDialog(false)}
          onSubmit={handleCustomerSubmit}
          isPending={checkoutMutation.isPending}
          cart={cart}
          cartTotal={cartTotal}
        />
      </div>
    </AppLayout>
  );
};

export default Sales;
