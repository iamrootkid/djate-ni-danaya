import { useLocation, Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Tags, Package, Users, FileBarChart2, Settings, Store, Receipt, LogOut, DollarSign } from "lucide-react";
import { Sidebar as UISidebar, SidebarContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserProfile } from "@/components/Dashboard/UserProfile";

// Define menu items with role restrictions
const menuItems = [
  {
    href: "/dashboard",
    label: "Tableau de bord",
    icon: LayoutDashboard,
    roles: ["admin"]
  },
  {
    href: "/categories",
    label: "Catégories",
    icon: Tags,
    roles: ["admin"]
  },
  {
    href: "/products",
    label: "Produits",
    icon: Package,
    roles: ["admin"]
  },
  {
    href: "/staff",
    label: "Personnel",
    icon: Users,
    roles: ["admin"]
  },
  {
    href: "/expenses",
    label: "Dépenses",
    icon: DollarSign,
    roles: ["admin"]
  },
  {
    href: "/reports",
    label: "Rapports",
    icon: FileBarChart2,
    roles: ["admin"]
  },
  {
    href: "/invoices",
    label: "Factures",
    icon: Receipt,
    roles: ["admin"]
  },
  {
    href: "/settings",
    label: "Paramètres",
    icon: Settings,
    roles: ["admin"]
  },
  {
    href: "/sales",
    label: "Ventes",
    icon: Store,
    roles: ["employee"]
  }
];

const Navigation = ({
  userRole
}: {
  userRole: "employee" | "admin";
}) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <SidebarMenu>
      {filteredMenuItems.map(({ href, label, icon: Icon }) => (
        <SidebarMenuItem key={href}>
          <SidebarMenuButton
            asChild
            isActive={isActive(href)}
            className={`w-full justify-start transition-colors duration-200 ${
              isActive(href)
                ? "bg-primary/10 text-primary font-medium hover:bg-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Link to={href} className="flex items-center px-4 py-2.5 space-x-3">
              <Icon className="h-5 w-5" />
              <span className="font-medium">{label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};

export const Sidebar = ({ userRole }: { userRole: "employee" | "admin" }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
      toast.success("Déconnecté avec succès");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return (
    <UISidebar>
      <SidebarContent className="flex flex-col h-full">
        <div className="px-4 py-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            DJATE NI DANAYA
          </h1>
        </div>
        <div className="flex-1">
          <Navigation userRole={userRole} />
        </div>
        <div className="p-4 mt-auto">
          <UserProfile />
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 mt-4"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Déconnexion
          </Button>
        </div>
      </SidebarContent>
    </UISidebar>
  );
};