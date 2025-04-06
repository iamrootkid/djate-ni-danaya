import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useDashboardRole = () => {
  const [userRole, setUserRole] = useState<"admin" | "employee">("employee");

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role) {
          setUserRole(profile.role as "admin" | "employee");
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
  }, []);

  return { userRole };
}; 