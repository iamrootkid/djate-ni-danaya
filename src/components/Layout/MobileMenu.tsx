
import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Tags,
  Package,
  Users,
  FileBarChart2,
  Settings,
  Store,
  Receipt,
  Menu,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  userRole: "admin" | "employee";
}

export const MobileMenu = ({ userRole }: MobileMenuProps) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Admin-specific menu items
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

  // Select which menu items to show based on user role
  const menuItems = userRole === 'admin' ? adminMenuItems : employeeMenuItems;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden fixed bottom-4 right-4 z-50 rounded-full w-14 h-14 bg-primary shadow-lg hover:bg-primary/90"
        >
          <Menu className="h-6 w-6 text-white" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <nav className="space-y-4 pt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-gray-100"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5",
                  isActive ? "text-primary" : "text-gray-500"
                )} />
                <span className={cn(
                  "font-medium",
                  isActive ? "text-primary" : "text-gray-700"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
};
