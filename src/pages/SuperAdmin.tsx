
import React from "react";
import { SuperAdminLayout } from "@/components/Layout/SuperAdminLayout";
import { SuperAdminDashboard } from "@/components/SuperAdmin/SuperAdminDashboard";
import { Navigate } from "react-router-dom";
import { getCurrentUserRole } from "@/utils/roleUtils";

const SuperAdmin = () => {
  const userRole = getCurrentUserRole();

  if (userRole !== 'super_admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <SuperAdminLayout>
      <SuperAdminDashboard />
    </SuperAdminLayout>
  );
};

export default SuperAdmin;
