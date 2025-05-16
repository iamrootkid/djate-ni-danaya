import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, fixJwtTokenIfNeeded } from "@/integrations/supabase/client";
import { filterByUUID } from "@/utils/supabaseHelpers";
import { ToastProviderContext } from "@/hooks/use-toast";
import Login from "./pages/Login";

// Import all page components
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Staff from "./pages/Staff";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Invoices from "./pages/Invoices";
import Expenses from "./pages/Expenses";
import Personnel from "./pages/Personnel";

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!user || authLoading) {
      return;
    }

    const checkAuth = async () => {
      try {
        if (authLoading) {
          return;
        }
        
        if (!user) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('role')
              .match(filterByUUID('id', user.id))
              .maybeSingle();

            if (error) {
              console.error(`Error fetching user role (attempt ${retryCount + 1}):`, error);
              retryCount++;
              if (retryCount === maxRetries) {
                setIsAuthenticated(false);
                setLoading(false);
                return;
              }
              // Wait before retrying
              await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
              continue;
            }

            if (profile && typeof profile === "object" && "role" in profile) {
              const role = profile.role || 'employee';
              setUserRole(role);
              setIsAuthenticated(true);
              setLoading(false);
              return;
            } else {
              console.error("No profile found for user or profile missing role");
              setIsAuthenticated(false);
              setLoading(false);
              return;
            }
          } catch (error) {
            console.error(`Error in auth check (attempt ${retryCount + 1}):`, error);
            retryCount++;
            if (retryCount === maxRetries) {
              setIsAuthenticated(false);
              setLoading(false);
              return;
            }
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          }
        }
      } catch (error) {
        console.error('Error in auth check:', error);
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    checkAuth();
  }, [user, authLoading]);

  if (loading || authLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userRole === 'admin' && window.location.pathname === '/sales') {
    return <Navigate to="/dashboard" replace />;
  }

  if (userRole && (allowedRoles.includes(userRole) || userRole === 'admin')) {
    return <>{children}</>;
  }

  return <Navigate to="/dashboard" replace />;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (
          error instanceof Error &&
          'status' in (error as any) &&
          ([401, 403, 429].includes((error as any).status))
        ) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      staleTime: 60000,
    },
  },
});

const App = () => {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <ToastProviderContext>
              <SidebarProvider>
                <TooltipProvider>
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
                    <Route
                      path="/personnel"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <Personnel />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                  <Toaster />
                  <Sonner />
                </TooltipProvider>
              </SidebarProvider>
            </ToastProviderContext>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
