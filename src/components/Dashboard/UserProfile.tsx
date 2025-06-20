import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { filterByUUID } from "@/utils/supabaseHelpers";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export const UserProfile = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email);
          
          // Get user role from profiles table using safe UUID filtering
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .match(filterByUUID('id', user.id))
            .maybeSingle();
            
          if (error) {
            console.error('Error fetching user role:', error);
            return;
          }
          
          // Use safe data access
          if (data && typeof data === 'object' && 'role' in data) {
            const role = data.role || 'User';
            setUserRole(role);
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    
    getUser();
  }, []);

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10 border-2 border-white">
        <AvatarFallback className="bg-primary text-white">
          {userEmail ? userEmail[0].toUpperCase() : 'U'}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-white">{userEmail}</span>
        <span className="text-xs text-gray-300 capitalize">{userRole || 'User'}</span>
      </div>
    </div>
  );
};
