
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useDashboardRole = () => {
  const [userRole, setUserRole] = useState<"admin" | "employee">("employee");
  
  useEffect(() => {
    const getUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (profileData?.role === 'admin') {
          setUserRole('admin');
        }
      }
    };
    getUserRole();
  }, []);
  
  return { userRole };
};
