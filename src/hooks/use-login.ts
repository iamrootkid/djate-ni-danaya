
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, fixJwtTokenIfNeeded, shouldRateLimit } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LoginFormValues } from "@/components/auth/schemas/loginSchema";
import { getErrorMessage } from "@/components/auth/utils/authErrorUtils";
import { asUUID, safeDataAccess } from "@/utils/supabaseHelpers";

// Add a cache for shopIds to avoid repeated lookups
const shopCache = new Map<string, boolean>();

export const useLogin = (role: 'admin' | 'employee') => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values: LoginFormValues, shopId: string) => {
    setLoading(true);
    
    try {
      // Rate limiting check - improved implementation
      if (shouldRateLimit('login', 3, 60000)) { // Max 3 login attempts per minute
        throw new Error(`Trop de tentatives de connexion. Veuillez réessayer dans quelques minutes.`);
      }
      
      // Record login attempt for tracking
      const now = Date.now();
      localStorage.setItem('lastLoginAttempt', now.toString());
      
      // Check if shop exists - use cache if available to reduce API calls
      let shopExists = shopCache.get(shopId);
      if (shopExists === undefined) {
        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('id')
          .eq('id', shopId)
          .maybeSingle();
        
        if (shopError) {
          console.error("Shop verification error:", shopError);
          throw new Error(`Erreur lors de la vérification du magasin: ${shopError.message}`);
        }
        
        shopExists = !!shopData;
        shopCache.set(shopId, shopExists); // Cache the result
      }
      
      if (!shopExists) {
        throw new Error(`Ce magasin n'existe pas. Veuillez vérifier l'identifiant du magasin.`);
      }

      // Clear any existing sessions before login to prevent conflicts
      await supabase.auth.signOut();
      
      // Wait before authentication to help with rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Authenticate the user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user || !authData.session) {
        throw new Error("Authentification échouée: Aucun utilisateur ou session n'a été créé");
      }

      // Fix JWT token issues immediately after login
      await fixJwtTokenIfNeeded();

      // Save the email for remember me
      if (values.rememberMe) {
        localStorage.setItem('rememberedEmail', values.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // Reset login attempts counter on successful login
      localStorage.removeItem('loginAttempts');

      // Wait before checking profile to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Fetch the user's profile to check their role and shop_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, shop_id')
        .eq('id', asUUID(authData.user.id))
        .maybeSingle();
      
      if (profileError) {
        console.error("Profile fetch error:", profileError);
        await supabase.auth.signOut();
        throw new Error('Impossible de récupérer le profil utilisateur');
      }
      
      if (!profile) {
        await supabase.auth.signOut();
        throw new Error("Profil utilisateur introuvable");
      }

      const userRole = safeDataAccess(profile, 'role');
      const userShopId = safeDataAccess(profile, 'shop_id');
      
      console.log('User role from profile:', userRole, 'Expected role:', role);
      console.log('User shop_id:', userShopId, 'Provided shop_id:', shopId);
      
      // Verify the user has the correct role - compare as strings
      if (userRole !== role) {
        await supabase.auth.signOut();
        throw new Error(`Authentification échouée: L'utilisateur n'a pas les privilèges ${role}`);
      }

      // Verify user's shop_id matches the provided one - string comparison
      if (userShopId !== shopId) {
        await supabase.auth.signOut();
        throw new Error(`Authentification échouée: L'utilisateur n'est pas associé à ce magasin`);
      }

      // Set shop ID in local storage
      localStorage.setItem('shopId', shopId);

      // Set user role in local storage
      localStorage.setItem('userRole', userRole);
      
      // Redirect to dashboard or sales based on role
      toast.success(`Connecté en tant que ${role}`);
      navigate(role === 'admin' ? '/dashboard' : '/sales');
      
    } catch (error: any) {
      const message = getErrorMessage(error);
      toast.error(message);
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { loading, handleLogin };
};
