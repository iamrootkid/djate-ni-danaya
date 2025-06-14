
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SuperAdminLayout } from "@/components/Layout/SuperAdminLayout";
import { SuperAdminDashboard } from "@/components/SuperAdmin/SuperAdminDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { getCurrentUserRole } from "@/utils/roleUtils";

const SuperAdmin = () => {
  const { isAuthenticated } = useAuth();
  const userRole = getCurrentUserRole();

  if (!isAuthenticated || userRole !== 'super_admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <SuperAdminLayout>
      <SuperAdminDashboard />
    </SuperAdminLayout>
  );
};

export default SuperAdmin;
