
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

export const UserProfile = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
        
        // Get user role from profiles table
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching user role:', error);
          return;
        }
        
        if (profileData) {
          setUserRole(profileData.role);
        }
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
