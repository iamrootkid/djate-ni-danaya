
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LoginFormValues } from "@/components/auth/schemas/loginSchema";
import { getErrorMessage } from "@/components/auth/utils/authErrorUtils";

export const useLogin = (role: 'admin' | 'employee') => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values: LoginFormValues, shopId: string) => {
    setLoading(true);
    
    try {
      // First check if the shop exists
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('id')
        .eq('id', shopId)
        .single();
      
      if (shopError || !shopData) {
        throw new Error(`Ce magasin n'existe pas. Veuillez vérifier l'identifiant du magasin.`);
      }

      // Then authenticate the user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (authError) {
        throw authError;
      }

      // Save the email for remember me
      if (values.rememberMe) {
        localStorage.setItem('rememberedEmail', values.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // Fetch the user's profile to check their role and shop_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, shop_id')
        .eq('id', authData.user.id)
        .single();
      
      if (profileError) {
        await supabase.auth.signOut();
        throw new Error('Impossible de récupérer le profil utilisateur');
      }

      console.log('User role from profile:', profile.role, 'Expected role:', role);
      console.log('User shop_id:', profile.shop_id, 'Provided shop_id:', shopId);
      
      // Verify the user has the correct role
      if (profile.role !== role) {
        await supabase.auth.signOut();
        throw new Error(`Authentification échouée: L'utilisateur n'a pas les privilèges ${role}`);
      }

      // Verify user's shop_id matches the provided one - STRICT VALIDATION
      if (profile.shop_id !== shopId) {
        await supabase.auth.signOut();
        throw new Error(`Authentification échouée: L'utilisateur n'est pas associé à ce magasin`);
      }

      // Set shop ID in local storage
      localStorage.setItem('shopId', shopId);

      // Set user role in local storage
      localStorage.setItem('userRole', profile.role);
      
      // Redirect to dashboard or sales based on role
      toast.success(`Connecté en tant que ${role}`);
      navigate(role === 'admin' ? '/dashboard' : '/sales');
      
    } catch (error: any) {
      const message = getErrorMessage(error);
      toast.error(message);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, handleLogin };
};
