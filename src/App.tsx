import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Sales from "./pages/Sales";
import Staff from "./pages/Staff";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Invoices from "./pages/Invoices";
import Expenses from "./pages/Expenses";
import Personnel from "@/pages/Personnel";

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("employee" | "admin")[];
}

const ProtectedRoute = ({ children, allowedRoles = ["employee", "admin"] }: ProtectedRouteProps) => {
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [shopId, setShopId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for shop ID in localStorage
    const storedShopId = localStorage.getItem('shopId');
    if (!storedShopId) {
      // Redirect to login if no shop ID is found
      setLoading(false);
      return;
    }
    
    setShopId(storedShopId);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        supabase
          .from('profiles')
          .select('role, shop_id')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setUserRole(data.role || null);
              
              // Verify shop_id matches what's in the profile
              if (data.shop_id !== storedShopId) {
                console.error("Shop ID mismatch, clearing session");
                localStorage.removeItem('shopId');
                supabase.auth.signOut();
                window.location.href = '/login';
                return;
              }
            }
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('role, shop_id')
          .eq('id', session.user.id)
          .single();
        
        if (data) {
          setUserRole(data.role || null);
          
          // Verify shop_id matches what's in the profile
          if (data.shop_id !== storedShopId) {
            console.error("Shop ID mismatch in auth state change");
            localStorage.removeItem('shopId');
            supabase.auth.signOut();
            window.location.href = '/login';
            return;
          }
        }
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!shopId) {
    return <Navigate to="/login" />;
  }

  if (!session) {
    return <Navigate to="/login" />;
  }

  if (!userRole || !allowedRoles.includes(userRole as "employee" | "admin")) {
    return <Navigate to={userRole === "employee" ? "/sales" : "/dashboard"} />;
  }

  return <>{children}</>;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route 
                path="/" 
                element={<Navigate to="/login" replace />}
              />
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Categories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Products />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sales"
                element={
                  <ProtectedRoute allowedRoles={["employee"]}>
                    <Sales />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Staff />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/invoices"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Invoices />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/expenses"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Expenses />
                  </ProtectedRoute>
                }
              />
              <Route path="/personnel" element={<Personnel />} />
            </Routes>
          </BrowserRouter>
        </SidebarProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
