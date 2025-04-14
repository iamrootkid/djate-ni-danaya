
import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import "./App.css";
import { ToastProvider } from "@/components/ToastProvider"; // Fixed import path

// Lazy load pages
const Login = React.lazy(() => import("@/pages/Login"));
const Dashboard = React.lazy(() => import("@/pages/Dashboard"));
const Categories = React.lazy(() => import("@/pages/Categories"));
const Products = React.lazy(() => import("@/pages/Products"));
const Sales = React.lazy(() => import("@/pages/Sales"));
const Reports = React.lazy(() => import("@/pages/Reports"));
const Invoices = React.lazy(() => import("@/pages/Invoices"));
const Staff = React.lazy(() => import("@/pages/Staff"));
const Settings = React.lazy(() => import("@/pages/Settings"));
const Personnel = React.lazy(() => import("@/pages/Personnel"));
const Expenses = React.lazy(() => import("@/pages/Expenses"));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster />
        <ToastProvider />
        <Suspense fallback={<div>Chargement...</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/products" element={<Products />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/personnel" element={<Personnel />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
