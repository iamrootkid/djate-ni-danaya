
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

  const createSuperAdminAccess = async () => {
    try {
      await supabase.auth.signOut(); // Start with a clean slate

      let authResponse = await supabase.auth.signInWithPassword({
        email: 'superadmin@system.app',
        password: 'SuperAdmin123!',
      });

      // If sign-in fails because user doesn't exist, try signing up
      if (authResponse.error && authResponse.error.message.includes('Invalid login credentials')) {
        authResponse = await supabase.auth.signUp({
          email: 'superadmin@system.app',
          password: 'SuperAdmin123!',
        });
      }

      if (authResponse.error) {
        throw authResponse.error;
      }

      if (!authResponse.data.user) {
        throw new Error("Failed to authenticate super admin user.");
      }

      // Ensure the profile is set to super_admin
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authResponse.data.user.id,
          email: 'superadmin@system.app',
          role: 'super_admin',
          first_name: 'Super',
          last_name: 'Admin',
          shop_id: '00000000-0000-0000-0000-000000000001',
        });

      if (profileError) {
        throw new Error("Failed to update profile to super admin");
      }

      localStorage.setItem('userRole', 'super_admin');
      localStorage.setItem('shopId', '00000000-0000-0000-0000-000000000001');
      
      toast.success("Super Admin access granted");
      navigate('/super-admin');
    } catch (error: any) {
      console.error("Super admin access error:", error);
      toast.error(error.message || "Failed to grant super admin access");
    }
  };

  const verifyShopId = async (values: ShopIdValues) => {
    setLoading(true);
    setError(null);
    
    try {
      if (values.shopId === '128076') {
        await createSuperAdminAccess();
        return;
      }
      
      const { data: shopData, error } = await supabase
        .from('shops')
        .select('id, name, pin_code')
        .eq('pin_code', values.shopId)
        .limit(1)
        .maybeSingle();
      
      if (error) {
        throw new Error(`Error verifying shop: ${error.message}`);
      }
      
      if (!shopData) {
        throw new Error("Shop not found. Please check the shop ID.");
      }
      
      const shop = shopData;
      if (!shop?.name) {
        throw new Error("Invalid shop data.");
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
                  placeholder="Ex: 123456 ou 128076 (Super Admin)"
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
