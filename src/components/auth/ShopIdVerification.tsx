
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
import { isQueryError, safeSingleResult, asParam } from "@/utils/safeFilters";

const shopIdSchema = z.object({
  shopId: z.string().uuid("L'identifiant du magasin doit être un UUID valide").min(1, "L'identifiant du magasin est requis"),
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
      console.log(`Verifying shop ID: ${values.shopId}`);
      
      const { data: shopData, error } = await supabase
        .from('shops')
        .select('id, name')
        .eq('id', asParam(values.shopId))
        .limit(1)
        .maybeSingle();
      
      console.log("Shop query response:", { data: shopData, error });
      
      if (error) {
        throw new Error(`Erreur lors de la vérification du magasin: ${error.message}`);
      }
      
      if (!shopData || isQueryError(shopData)) {
        throw new Error("Magasin non trouvé. Veuillez vérifier l'identifiant du magasin.");
      }
      
      const shop = safeSingleResult<{id: string, name: string}>(shopData);
      if (!shop?.name) {
        throw new Error("Données du magasin invalides");
      }
      
      toast.success(`Magasin vérifié: ${shop.name}`);
      localStorage.setItem('shopId', values.shopId);
      onVerified(true, values.shopId);
    } catch (error: any) {
      console.error("Shop verification error:", error);
      setError(error.message || "Erreur lors de la vérification");
      toast.error(error.message || "Erreur lors de la vérification");
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
                  placeholder="Ex: 123e4567-e89b-12d3-a456-426614174000"
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
