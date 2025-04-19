
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileMenu } from "./MobileMenu";
import { supabase } from "@/integrations/supabase/client";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  filterByUUID, 
  safeGetProfileData, 
  isValidRole 
} from "@/utils/supabaseHelpers";
import { Role } from "@/types/auth";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [userRole, setUserRole] = useState<Role>('employee');
  const navigate = useNavigate();

  useEffect(() => {
    const getRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .match(filterByUUID('id', session.user.id))
          .single();
        
        if (error) {
          console.error("Error fetching user role:", error);
          return;
        }
        
        const role = safeGetProfileData(data, 'role', 'employee');
        if (isValidRole(role)) {
          setUserRole(role);
          // Redirect to appropriate initial route based on role
          if (role === 'admin' && window.location.pathname === '/sales') {
            navigate('/dashboard');
          } else if (role === 'employee' && window.location.pathname !== '/sales') {
            navigate('/sales');
          }
        }
      }
    };

    getRole();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        getRole();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar userRole={userRole} />
      <MobileMenu userRole={userRole} />
      <main className="flex-1 overflow-x-hidden">
        <div className="sticky top-0 z-10 bg-white shadow-sm md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              <SidebarTrigger>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="hover:bg-gray-100 rounded-full"
                >
                  <Menu className="h-6 w-6 text-gray-700" />
                  <span className="sr-only">Toggle Sidebar</span>
                </Button>
              </SidebarTrigger>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                Store Manager
              </h1>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
};
