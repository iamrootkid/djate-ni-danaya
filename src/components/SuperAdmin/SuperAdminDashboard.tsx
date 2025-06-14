
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShopManagement } from "./ShopManagement";
import { UserManagement } from "./UserManagement";
import { SystemOverview } from "./SystemOverview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const SuperAdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Panneau Super Administrateur</h1>
        <p className="text-red-100">Gestion globale du système DJATE NI DANAYA</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="shops">Gestion des magasins</TabsTrigger>
          <TabsTrigger value="users">Gestion des utilisateurs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <SystemOverview />
        </TabsContent>

        <TabsContent value="shops">
          <ShopManagement />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};
