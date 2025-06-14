
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Shield, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const UserManagement = () => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['super-admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_all_users_with_shops');
      if (error) throw error;
      return data;
    },
  });

  const { data: shops } = useQuery({
    queryKey: ['super-admin-shops'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_all_shops');
      if (error) throw error;
      return data;
    },
  });

  const assignUserMutation = useMutation({
    mutationFn: async ({ userId, shopId, role }: { userId: string; shopId: string; role: string }) => {
      const { data, error } = await supabase.rpc('assign_user_to_shop', {
        user_id_param: userId,
        shop_id_param: shopId,
        role_param: role,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Utilisateur assigné avec succès");
      setSelectedUser(null);
      setSelectedShop(null);
      setSelectedRole(null);
      queryClient.invalidateQueries({ queryKey: ['super-admin-users'] });
    },
    onError: (error) => {
      console.error('Error assigning user:', error);
      toast.error("Erreur lors de l'assignation de l'utilisateur");
    },
  });

  const handleAssignUser = () => {
    if (!selectedUser || !selectedShop || !selectedRole) {
      toast.error("Veuillez sélectionner un utilisateur, un magasin et un rôle");
      return;
    }
    assignUserMutation.mutate({
      userId: selectedUser,
      shopId: selectedShop,
      role: selectedRole,
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'employee':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Shield className="h-4 w-4" />;
      case 'admin':
        return <UserCheck className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  if (usersLoading) {
    return <div>Chargement des utilisateurs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des utilisateurs</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigner un utilisateur à un magasin</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Utilisateur</label>
              <Select value={selectedUser || ""} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un utilisateur" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.email} ({user.first_name} {user.last_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Magasin</label>
              <Select value={selectedShop || ""} onValueChange={setSelectedShop}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un magasin" />
                </SelectTrigger>
                <SelectContent>
                  {shops?.map((shop) => (
                    <SelectItem key={shop.id} value={shop.id}>
                      {shop.name} (PIN: {shop.pin_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Rôle</label>
              <Select value={selectedRole || ""} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrateur</SelectItem>
                  <SelectItem value="employee">Employé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleAssignUser}
                disabled={assignUserMutation.isPending}
                className="w-full"
              >
                {assignUserMutation.isPending ? "Assignation..." : "Assigner"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users?.map((user) => (
              <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  {getRoleIcon(user.role)}
                  <div>
                    <div className="font-medium">{user.first_name} {user.last_name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role === 'super_admin' ? 'Super Admin' : 
                     user.role === 'admin' ? 'Administrateur' : 'Employé'}
                  </Badge>
                  {user.shop_name && (
                    <div className="text-sm text-gray-600">
                      Magasin: {user.shop_name}
                    </div>
                  )}
                  <div className="text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
