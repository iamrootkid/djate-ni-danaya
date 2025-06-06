import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Settings } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AddPersonnelForm } from "./AddPersonnelForm";

interface User {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  shop_id: string;
  shop_name: string;
  created_at: string;
}

interface Shop {
  id: string;
  name: string;
}

export const UserManagement = () => {
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedShop, setSelectedShop] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: users, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['super-admin-users'],
    queryFn: async () => {
      console.log('Fetching users...');
      
      try {
        const { data, error } = await supabase.rpc('get_all_users_with_shops');
        if (error) throw error;
        console.log('Users fetched via RPC:', data);
        return data as User[];
      } catch (rpcError) {
        console.log('RPC failed, using direct query');
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select(`
            id,
            email,
            first_name,
            last_name,
            role,
            shop_id,
            created_at
          `);
          
        if (profilesError) throw profilesError;

        const { data: shopsData } = await supabase
          .from('shops')
          .select('id, name');

        const usersWithShops = (profilesData || []).map(profile => ({
          user_id: profile.id,
          email: profile.email,
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          role: profile.role,
          shop_id: profile.shop_id,
          shop_name: shopsData?.find(shop => shop.id === profile.shop_id)?.name || '',
          created_at: profile.created_at
        }));

        return usersWithShops as User[];
      }
    },
    retry: 1,
    retryDelay: 1000,
  });

  const { data: shops, error: shopsError } = useQuery({
    queryKey: ['super-admin-shops-list'],
    queryFn: async () => {
      console.log('Fetching shops for user assignment...');
      
      const { data, error } = await supabase
        .from('shops')
        .select('id, name')
        .order('name');
        
      if (error) throw error;
      
      console.log('Shops for assignment fetched:', data);
      return data as Shop[];
    },
    retry: 1,
    retryDelay: 1000,
  });

  const handleAssignUser = async () => {
    if (!selectedUser || !selectedShop || !selectedRole) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      console.log('Assigning user:', { selectedUser, selectedShop, selectedRole });
      
      try {
        const { data, error } = await supabase.rpc('assign_user_to_shop', {
          user_id_param: selectedUser,
          shop_id_param: selectedShop,
          role_param: selectedRole,
        });

        if (error) throw error;
        console.log('User assigned via RPC:', data);
      } catch (rpcError) {
        console.log('RPC failed, using direct update');
        
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            shop_id: selectedShop,
            role: selectedRole,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedUser);

        if (profileError) throw profileError;

        const { error: staffError } = await supabase
          .from('staff')
          .upsert({
            id: selectedUser,
            shop_id: selectedShop,
            role: selectedRole,
            updated_at: new Date().toISOString()
          });

        if (staffError) {
          console.log('Staff update failed (non-critical):', staffError);
        }
      }

      toast.success('Utilisateur assigné avec succès');
      setSelectedUser('');
      setSelectedShop('');
      setSelectedRole('');
      setIsAssignDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['super-admin-users'] });
    } catch (error: any) {
      console.error('Error assigning user:', error);
      toast.error(error.message || 'Erreur lors de l\'assignation');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'employee':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (usersError || shopsError) {
    const error = usersError || shopsError;
    console.error('Error in UserManagement:', error);
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Erreur lors du chargement des données utilisateurs</p>
            <p className="text-sm text-gray-500 mt-2">
              {error instanceof Error ? error.message : 'Erreur inconnue'}
            </p>
            <Button 
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['super-admin-users'] });
                queryClient.invalidateQueries({ queryKey: ['super-admin-shops-list'] });
              }}
              className="mt-4"
            >
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const unassignedUsers = users?.filter(user => !user.shop_id) || [];
  const assignedUsers = users?.filter(user => user.shop_id) || [];

  if (usersLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Utilisateurs</h2>
          <p className="text-gray-600">Assigner des rôles et gérer les accès par magasin</p>
        </div>
        
        <div className="flex gap-2">
          <AddPersonnelForm shops={shops || []} />
          
          <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2" disabled={unassignedUsers.length === 0}>
                <UserPlus className="h-4 w-4" />
                Assigner Utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assigner un utilisateur à un magasin</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="user-select">Utilisateur</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un utilisateur" />
                    </SelectTrigger>
                    <SelectContent>
                      {unassignedUsers.map((user) => (
                        <SelectItem key={user.user_id} value={user.user_id}>
                          {user.email} ({user.first_name} {user.last_name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="shop-select">Magasin</Label>
                  <Select value={selectedShop} onValueChange={setSelectedShop}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un magasin" />
                    </SelectTrigger>
                    <SelectContent>
                      {shops?.map((shop) => (
                        <SelectItem key={shop.id} value={shop.id}>
                          {shop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="role-select">Rôle</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrateur</SelectItem>
                      <SelectItem value="employee">Employé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAssignDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button onClick={handleAssignUser} disabled={loading}>
                    {loading ? 'Attribution...' : 'Assigner'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {unassignedUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Utilisateurs non assignés ({unassignedUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unassignedUsers.map((user) => (
                <div key={user.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{user.first_name} {user.last_name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Utilisateurs assignés ({assignedUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignedUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun utilisateur assigné</p>
              <p className="text-sm mt-2">Les utilisateurs assignés apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-2">
              {assignedUsers.map((user) => (
                <div key={user.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{user.first_name} {user.last_name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">Magasin: {user.shop_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
