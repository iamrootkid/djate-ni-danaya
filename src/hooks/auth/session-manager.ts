
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthUser } from "@/types/auth";
import { isValidRole } from "@/utils/roleManagement";
import { safeGetProfileData } from "@/utils/supabaseHelpers";

export async function getUserFromSession(session: Session | null): Promise<AuthUser | null> {
  if (!session?.user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, shop_id')
    .eq('id', session.user.id)
    .single();

  if (profileError) {
    throw profileError;
  }

  const role = safeGetProfileData(profile, 'role', 'employee');
  if (!isValidRole(role)) {
    throw new Error('Invalid role in user profile');
  }

  return {
    id: session.user.id,
    email: session.user.email!,
    role: role,
    shopId: profile.shop_id,
  };
}
