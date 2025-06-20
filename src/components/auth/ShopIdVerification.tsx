import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const shopIdSchema = z.object({
  shopId: z.string().length(6, "The shop ID must be a 6-digit PIN.").regex(/^\d+$/, "The shop ID must contain only digits.").min(1, "The shop ID is required."),
});

type ShopIdValues = z.infer<typeof shopIdSchema>;

interface ShopIdVerificationProps {
  onVerified: (verified: boolean, shopId: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const ShopIdVerification = ({
  onVerified,
  loading,
  setLoading,
}: ShopIdVerificationProps) => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const form = useForm<ShopIdValues>({
    resolver: zodResolver(shopIdSchema),
    defaultValues: {
      shopId: "",
    },
  });

  const verifyShopId = async (values: ShopIdValues) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: shopData, error: queryError } = await supabase
        .from('shops')
        .select('id, name, pin_code')
        .eq('pin_code', values.shopId as any)
        .limit(1)
        .maybeSingle();
      
      if (queryError) {
        throw new Error(`Error verifying shop: ${queryError.message}`);
      }
      
      const shop = shopData as { id: string; name: string; pin_code: string } | null;

      if (!shop || !shop.id || !shop.name) {
        throw new Error("Shop not found or data is invalid. Please check the shop ID.");
      }
      
      toast.success(`Shop verified: ${shop.name}`);
      localStorage.setItem('shopId', shop.id);
      onVerified(true, shop.id);
    } catch (error: any) {
      console.error("Shop verification error:", error);
      setError(error.message || "Error during verification");
      toast.error(error.message || "Error during verification");
      form.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(verifyShopId)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="shopId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identifiant du magasin</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ex: 123456"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary-dark text-white transition-colors"
          disabled={loading}
        >
          {loading ? "Vérification..." : "Vérifier"}
        </Button>
      </form>
    </Form>
  );
};
