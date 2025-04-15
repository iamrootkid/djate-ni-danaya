
import { useLocation, Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Tags, Package, Users, FileBarChart2, Settings, Store, Receipt, LogOut, DollarSign } from "lucide-react";
import { Sidebar as UISidebar, SidebarContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserProfile } from "@/components/Dashboard/UserProfile";

// Define admin menu items separately from employee items
const adminMenuItems = [
  {
    href: "/dashboard",
    label: "Tableau de bord",
    icon: LayoutDashboard,
  },
  {
    href: "/categories",
    label: "Catégories",
    icon: Tags,
  },
  {
    href: "/products",
    label: "Produits",
    icon: Package,
  },
  {
    href: "/staff",
    label: "Personnel",
    icon: Users,
  },
  {
    href: "/expenses",
    label: "Dépenses",
    icon: DollarSign,
  },
  {
    href: "/reports",
    label: "Rapports",
    icon: FileBarChart2,
  },
  {
    href: "/invoices",
    label: "Factures",
    icon: Receipt,
  },
  {
    href: "/settings",
    label: "Paramètres",
    icon: Settings,
  }
];

// Employee-specific menu items
const employeeMenuItems = [
  {
    href: "/sales",
    label: "Ventes",
    icon: Store,
  }
];

const Navigation = ({
  userRole
}: {
  userRole: "employee" | "admin";
}) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  // Only show admin menu items for admins, and employee items for employees
  // We ensure that admin users never see the Sales menu item
  const menuItems = userRole === 'admin' ? adminMenuItems : employeeMenuItems;

  return (
    <SidebarMenu>
      {menuItems.map(({ href, label, icon: Icon }) => (
        <SidebarMenuItem key={href}>
          <SidebarMenuButton
            asChild
            isActive={isActive(href)}
            className={`w-full justify-start transition-colors duration-200 ${
              isActive(href)
                ? "bg-primary/10 text-primary font-medium hover:bg-primary/20"
                : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
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

interface SidebarProps {
  userRole: "employee" | "admin";
}

export const Sidebar = ({ userRole }: SidebarProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Déconnexion réussie");
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return (
    <UISidebar className="border-r border-gray-200 bg-white">
      <div className="p-4 border-b border-gray-200">
        <h1 className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-2xl font-bold text-violet-600">
          Gestionnaire de Magasin
        </h1>
      </div>
      <SidebarContent className="flex flex-col h-full">
        <div className="flex-grow">
          <Navigation userRole={userRole} />
        </div>
        <div className="p-4 border-t border-gray-200">
          <div className="mb-4">
            <UserProfile />
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Déconnexion
          </Button>
        </div>
      </SidebarContent>
    </UISidebar>
  );
};
