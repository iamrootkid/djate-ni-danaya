
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

const shopPinSchema = z.object({
  pinCode: z.string()
    .length(6, "Le code PIN doit contenir exactement 6 chiffres")
    .regex(/^\d{6}$/, "Le code PIN doit contenir uniquement des chiffres"),
});

type ShopPinValues = z.infer<typeof shopPinSchema>;

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
  
  const form = useForm<ShopPinValues>({
    resolver: zodResolver(shopPinSchema),
    defaultValues: {
      pinCode: "",
    },
  });

  const verifyShopPin = async (values: ShopPinValues) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Verifying shop PIN: ${values.pinCode}`);
      
      // Utiliser la fonction RPC pour obtenir l'UUID du magasin à partir du PIN
      const { data: shopUuid, error } = await supabase
        .rpc('get_shop_id_by_pin', { pin_code_param: values.pinCode });
      
      console.log("Shop query response:", { data: shopUuid, error });
      
      if (error) {
        throw new Error(`Erreur lors de la vérification du magasin: ${error.message}`);
      }
      
      if (!shopUuid) {
        throw new Error("Code PIN invalide. Veuillez vérifier votre code PIN.");
      }
      
      // Vérifier que le magasin existe et récupérer son nom
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('id, name')
        .eq('id', shopUuid)
        .single();
      
      if (shopError || !shopData) {
        throw new Error("Magasin non trouvé.");
      }
      
      toast.success(`Magasin vérifié: ${shopData.name}`);
      localStorage.setItem('shopId', shopUuid);
      localStorage.setItem('shopPin', values.pinCode); // Stocker aussi le PIN pour l'affichage
      onVerified(true, shopUuid);
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
      <form onSubmit={form.handleSubmit(verifyShopPin)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="pinCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code PIN du magasin</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="123456"
                  className="text-center text-lg tracking-widest"
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
