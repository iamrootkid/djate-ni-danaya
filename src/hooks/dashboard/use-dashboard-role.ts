
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { safeSingleResult } from "@/utils/safeFilters";
import { UserRole } from "@/types/invoice";

export const useDashboardRole = () => {
  const [userRole, setUserRole] = useState<UserRole>("employee");

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          return;
        }
        
        const profile = safeSingleResult<{role: string}>(data);
        if (profile && (profile.role === 'admin' || profile.role === 'employee' || profile.role === 'owner')) {
          setUserRole(profile.role as UserRole);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
  }, []);

  return { userRole };
};
