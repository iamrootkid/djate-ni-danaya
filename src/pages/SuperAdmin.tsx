
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShopManagement } from "@/components/SuperAdmin/ShopManagement";
import { UserManagement } from "@/components/SuperAdmin/UserManagement";
import { GlobalStats } from "@/components/SuperAdmin/GlobalStats";
import { SystemSettings } from "@/components/SuperAdmin/SystemSettings";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SuperAdmin = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkSuperAdminAccess();
  }, []);

  const checkSuperAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate('/login');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error || !profile || profile.role !== 'super_admin') {
        toast.error('Accès refusé: Privilèges Super Admin requis');
        navigate('/dashboard');
        return;
      }

      setIsAuthorized(true);
    } catch (error) {
      console.error('Error checking super admin access:', error);
      toast.error('Erreur lors de la vérification des accès');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification des accès...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Administration Système
          </h1>
          <p className="text-gray-600">
            Gestion globale des magasins, utilisateurs et paramètres système
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
            <TabsTrigger value="shops">Magasins</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <GlobalStats />
          </TabsContent>

          <TabsContent value="shops">
            <ShopManagement />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="settings">
            <SystemSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SuperAdmin;
