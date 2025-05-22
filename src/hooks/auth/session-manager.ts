
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthUser, Role } from "@/types/auth";
import { isValidRole } from "@/utils/roleManagement";
import { safeSingleResult } from "@/utils/safeFilters";

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

  // Use type safe access
  const safeProfile = safeSingleResult<{role: string, shop_id?: string}>(profile);
  if (!safeProfile) {
    throw new Error('User profile not found');
  }

  const role = safeProfile.role;
  if (!isValidRole(role)) {
    throw new Error('Invalid role in user profile');
  }

  return {
    id: session.user.id,
    email: session.user.email!,
    role: role as Role,
    firstName: undefined,
    lastName: undefined,
    shopId: safeProfile.shop_id
  };
}
