
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useShopId } from "./use-shop-id";
import { CartItem } from "@/types/sales";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/components/ui/use-toast";

interface CheckoutProps {
  cart: CartItem[];
  cartTotal: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface CheckoutResult {
  invoiceNumber: string;
}

export const useCheckout = ({
  cart,
  cartTotal,
  onSuccess,
  onError,
}: CheckoutProps) => {
  const { shopId } = useShopId();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);

  // Use mutation for creating a sale and invoice
  const mutationFn = async ({
    customerName,
    customerPhone,
    paymentMethod = "cash",
  }: {
    customerName: string;
    customerPhone: string;
    paymentMethod?: string;
  }): Promise<CheckoutResult> => {
    if (!shopId) {
      throw new Error("Shop ID not found");
    }

    if (cart.length === 0) {
      throw new Error("Cart is empty");
    }

    setIsPending(true);

    try {
      // Generate a unique sale ID
      const saleId = uuidv4();

      // Create sale record
      const { error: saleError } = await supabase.from("sales").insert({
        id: saleId,
        shop_id: shopId,
        customer_name: customerName,
        customer_phone: customerPhone,
        total_amount: cartTotal,
        payment_method: paymentMethod || "cash",
        employee_id: (await supabase.auth.getUser()).data.user?.id,
      });

      if (saleError) throw new Error(`Error creating sale: ${saleError.message}`);

      // Insert sale items and update product stock
      const saleItems = cart.map((item) => ({
        sale_id: saleId,
        product_id: item.id,
        quantity: item.quantity,
        price_at_sale: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("sale_items")
        .insert(saleItems);

      if (itemsError) throw new Error(`Error creating sale items: ${itemsError.message}`);

      // Use the fixed atomic invoice creation function
      const { data: invoiceData, error: invoiceError } = await supabase
        .rpc("create_invoice_atomic", {
          shop_id_param: shopId,
          sale_id_param: saleId,
          customer_name_param: customerName,
          customer_phone_param: customerPhone
        });

      if (invoiceError) {
        console.error("Error creating invoice:", invoiceError);
        throw new Error(`Failed to create invoice: ${invoiceError.message}`);
      }

      if (!invoiceData || invoiceData.length === 0) {
        throw new Error("No invoice number generated");
      }

      return { invoiceNumber: invoiceData[0].invoice_number };
    } catch (error) {
      console.error("Error in checkout:", error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  const createSaleMutation = useMutation({
    mutationFn,
    onSuccess: (data) => {
      toast({
        title: "Vente réussie",
        description: "La facture a été générée avec succès",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du traitement de la vente",
        variant: "destructive",
      });
      
      if (onError) {
        onError(error);
      }
    },
  });

  // Function to handle checkout
  const handleCheckout = async (customerName: string, customerPhone: string, paymentMethod = "cash"): Promise<CheckoutResult> => {
    // Use the mutate async directly
    return createSaleMutation.mutateAsync({ customerName, customerPhone, paymentMethod });
  };

  return {
    handleCheckout,
    isPending: isPending || createSaleMutation.isPending,
    isError: createSaleMutation.isError,
    error: createSaleMutation.error,
    data: createSaleMutation.data,
  };
};
