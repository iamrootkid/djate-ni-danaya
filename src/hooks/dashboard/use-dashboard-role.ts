
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { filterByUUID, safeGetProfileData } from "@/utils/supabaseHelpers";

export const useDashboardRole = () => {
  const [userRole, setUserRole] = useState<"admin" | "employee">("employee");

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .match(filterByUUID("id", user.id))
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          return;
        }
        
        const role = safeGetProfileData(data, 'role', 'employee');
        if (role === 'admin' || role === 'employee') {
          setUserRole(role as "admin" | "employee");
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
  }, []);

  return { userRole };
};
