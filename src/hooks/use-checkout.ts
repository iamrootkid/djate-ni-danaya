
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CartItem } from "@/types/sales";
import { generateInvoiceNumber } from "@/utils/invoiceUtils";

interface CheckoutParams {
  customerName: string;
  customerPhone: string;
  cart: CartItem[];
  cartTotal: number;
  paymentMethod: string;
  shopId: string;
}

export const useCheckout = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ customerName, customerPhone, cart, cartTotal, paymentMethod, shopId }: CheckoutParams) => {
      try {
        console.log("Starting checkout process with data:", {
          customerName,
          customerPhone,
          cartItems: cart.length,
          cartTotal,
          paymentMethod,
          shopId
        });

        // Validate input parameters
        if (!shopId) {
          throw new Error("Identifiant de magasin manquant");
        }

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("Utilisateur non authentifié");
        }

        // Verify user has access to this shop
        console.log("Verifying shop access for user:", user.id, "shop:", shopId);
        
        // First get the user's role
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          throw new Error("Erreur lors de la vérification des permissions");
        }

        if (!userProfile) {
          throw new Error("Profil utilisateur non trouvé");
        }

        // For now, assume all users have access to all shops
        // TODO: Implement proper shop access control
        console.log("Shop access verification bypassed temporarily");
        
        // Create the sale
        console.log("Creating sale record...");
        const { data: saleData, error: saleError } = await supabase
          .from("sales")
          .insert({ 
            total_amount: cartTotal,
            customer_name: customerName,
            customer_phone: customerPhone,
            employee_id: user.id,
            shop_id: shopId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (saleError) {
          console.error("Sale creation error details:", {
            error: saleError,
            shopId,
            userId: user.id
          });
          throw new Error(`Erreur lors de la création de la vente: ${saleError.message}`);
        }

        if (!saleData) {
          console.error("No sale data returned after creation");
          throw new Error("La vente n'a pas été créée correctement");
        }

        console.log("Sale created successfully:", saleData);

        // Create sale items
        const saleItems = cart.map((item) => ({
          sale_id: saleData.id,
          product_id: item.id,
          quantity: item.quantity,
          price_at_sale: item.price,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        console.log("Creating sale items:", saleItems);

        const { error: itemsError } = await supabase
          .from("sale_items")
          .insert(saleItems);

        if (itemsError) {
          console.error("Sale items creation error details:", {
            error: itemsError,
            saleId: saleData.id,
            shopId
          });
          throw new Error("Erreur lors de la création des articles de la vente");
        }

        console.log("Sale items created successfully");

        // Generate invoice number
        console.log("Generating invoice number for shop:", shopId);
        const invoiceNumber = await generateInvoiceNumber(shopId);
        console.log("Generated invoice number:", invoiceNumber);

        // Create invoice
        const invoicePayload = {
          sale_id: saleData.id,
          customer_name: customerName,
          customer_phone: customerPhone,
          invoice_number: invoiceNumber,
          shop_id: shopId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        console.log("Creating invoice with payload:", invoicePayload);

        const { data: createdInvoice, error: createInvoiceError } = await supabase
          .from("invoices")
          .insert(invoicePayload)
          .select()
          .single();

        if (createInvoiceError) {
          console.error("Invoice creation error details:", {
            error: createInvoiceError,
            payload: invoicePayload,
            saleId: saleData.id,
            shopId: shopId
          });
          throw new Error(`Erreur lors de la création de la facture: ${createInvoiceError.message}`);
        }

        console.log("Invoice created successfully:", createdInvoice);
        return { saleData, invoiceNumber, invoiceData: createdInvoice };
      } catch (error: any) {
        console.error("Checkout process failed:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Checkout completed successfully:", data);
      toast({
        title: "Vente effectuée",
        description: `Facture N° ${data.invoiceNumber}`,
      });
      // Make sure we invalidate all relevant queries to refresh displayed data
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["stock-summary"] });
    },
    onError: (error: any) => {
      console.error("Checkout error:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la vente. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });
};
