import { AppLayout } from "@/components/Layout/AppLayout";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/types/sales";
import { ProductList } from "@/components/Sales/ProductList";
import { CartSummary } from "@/components/Sales/CartSummary";
import { SalesHeader } from "@/components/Sales/SalesHeader";
import { CustomerInfoDialog } from "@/components/Sales/CustomerInfoDialog";
import { useCart } from "@/hooks/use-cart";
import { useCheckout } from "@/hooks/use-checkout";
import { SalesStats } from "@/components/Sales/SalesStats";
import { CategoryFilter } from "@/components/Sales/CategoryFilter";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { useShopId } from "@/hooks/use-shop-id";

const Sales = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const isMobile = useIsMobile();
  const { shopId } = useShopId();
  const { toast } = useToast();
  
  const { cart, cartTotal, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();
  const checkoutMutation = useCheckout();

  // Redirect if no shop ID (should be handled by ProtectedRoute)
  useEffect(() => {
    if (!shopId) {
      console.error("No shop ID found, user should be redirected to login");
    }
  }, [shopId]);

  // Fetch products with category information, filtered by shop ID
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products", selectedCategory, shopId],
    queryFn: async () => {
      if (!shopId) return [];
      
      let query = supabase
        .from("products")
        .select(`
          *,
          categories:category_id (
            id,
            name
          )
        `)
        .eq("shop_id", shopId);
        
      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }
      
      query = query.order("name");
      
      const { data, error } = await query;
      if (error) throw error;
      return data as (Product & { categories: { name: string } | null })[];
    },
    enabled: !!shopId,
  });

  // Fetch category name for display, filtered by shop ID
  const { data: categoryData } = useQuery({
    queryKey: ["category", selectedCategory, shopId],
    queryFn: async () => {
      if (!selectedCategory || !shopId) return null;
      
      const { data, error } = await supabase
        .from("categories")
        .select("name")
        .eq("id", selectedCategory)
        .eq("shop_id", shopId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCategory && !!shopId,
  });

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCheckout = () => {
    setShowCustomerDialog(true);
  };

  const handleCustomerSubmit = async (customerName: string, customerPhone: string): Promise<{ invoiceNumber: string }> => {
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

        <SalesStats />

        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
          <Card className={`${isMobile ? 'mb-4' : ''}`}>
            <CardHeader className={`${isMobile ? 'py-3 px-4' : ''}`}>
              <CardTitle className={`${isMobile ? 'text-lg' : ''}`}>Produits</CardTitle>
            </CardHeader>
            <CardContent className={`${isMobile ? 'p-3' : ''}`}>
              <div className="relative mb-3">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher des produits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <CategoryFilter 
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
              
              <ProductList 
                products={filteredProducts || []} 
                addToCart={addToCart} 
                categoryName={categoryData?.name}
              />
            </CardContent>
          </Card>

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
