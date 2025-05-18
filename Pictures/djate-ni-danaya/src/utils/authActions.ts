
import { supabase } from "@/integrations/supabase/client";
import { LoginCredentials } from "@/types/auth";
import { shouldRateLimit } from "./rateLimiting";
import { toast } from "sonner";

export const handleLogin = async (credentials: LoginCredentials) => {
  if (shouldRateLimit('login')) {
    throw new Error('Too many login attempts. Please try again later.');
  }

  // Clear any existing sessions
  await supabase.auth.signOut();

  // Authenticate
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (authError) throw authError;

  // Handle remember me
  if (credentials.rememberMe) {
    localStorage.setItem('rememberedEmail', credentials.email);
  } else {
    localStorage.removeItem('rememberedEmail');
  }

  // Verify shop access
  if (authData.user && credentials.shopId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('shop_id')
      .eq('id', authData.user.id)
      .single();
      
    if (profile?.shop_id !== credentials.shopId) {
      await handleLogout();
      throw new Error('User does not have access to this shop');
    }
  }

  toast.success('Logged in successfully');
};

export const handleLogout = async () => {
  if (shouldRateLimit('logout')) {
    throw new Error('Please wait before logging out again');
  }

  const { error } = await supabase.auth.signOut();
  if (error) throw error;

  localStorage.removeItem('shopId');
  localStorage.removeItem('shop_id_cache');
  toast.success('Logged out successfully');
};
