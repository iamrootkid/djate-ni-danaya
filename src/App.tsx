
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/Layout/AppLayout";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Categories from "@/pages/Categories";
import Products from "@/pages/Products";
import Staff from "@/pages/Staff";
import Expenses from "@/pages/Expenses";
import Reports from "@/pages/Reports";
import Invoices from "@/pages/Invoices";
import Settings from "@/pages/Settings";
import Sales from "@/pages/Sales";
import SuperAdmin from "@/pages/SuperAdmin";
import SuperAdminLogin from "@/pages/SuperAdminLogin";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/super-admin-login" element={<SuperAdminLogin />} />
                <Route path="/super-admin" element={<SuperAdmin />} />
                <Route
                  path="/*"
                  element={
                    <SidebarProvider>
                      <AppLayout>
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/categories" element={<Categories />} />
                          <Route path="/products" element={<Products />} />
                          <Route path="/staff" element={<Staff />} />
                          <Route path="/expenses" element={<Expenses />} />
                          <Route path="/reports" element={<Reports />} />
                          <Route path="/invoices" element={<Invoices />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/sales" element={<Sales />} />
                        </Routes>
                      </AppLayout>
                    </SidebarProvider>
                  }
                />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
