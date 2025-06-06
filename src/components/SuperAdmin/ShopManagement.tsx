
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Store, UserPlus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Shop {
  id: string;
  name: string;
  address: string;
  pin_code: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
  total_sales: number;
  total_revenue: number;
}

interface User {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  shop_id: string;
}

export const ShopManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignAdminDialogOpen, setIsAssignAdminDialogOpen] = useState(false);
  const [newShop, setNewShop] = useState({ name: '', address: '' });
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [selectedShopForAdmin, setSelectedShopForAdmin] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: shops, isLoading, error } = useQuery({
    queryKey: ['super-admin-shops'],
    queryFn: async () => {
      console.log('Fetching shops for management...');
      
      try {
        const { data, error } = await supabase.rpc('get_all_shops');
        if (error) throw error;
        console.log('Shops fetched via RPC:', data);
        return data as Shop[];
      } catch (rpcError) {
        console.log('RPC failed, using direct query');
        
        const { data: shopsResult, error: shopsError } = await supabase
          .from('shops')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (shopsError) throw shopsError;

        const { data: salesData } = await supabase
          .from('sales')
          .select('shop_id, total_amount');

        const shopsWithStats = (shopsResult || []).map(shop => {
          const shopSales = salesData?.filter(sale => sale.shop_id === shop.id) || [];
          return {
            ...shop,
            total_sales: shopSales.length,
            total_revenue: shopSales.reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0)
          };
        });

        return shopsWithStats as Shop[];
      }
    },
    retry: 1,
    retryDelay: 1000,
  });

  const { data: unassignedUsers } = useQuery({
    queryKey: ['unassigned-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, role, shop_id')
        .is('shop_id', null)
        .neq('role', 'super_admin');
        
      if (error) throw error;
      
      return (data || []).map(profile => ({
        user_id: profile.id,
        email: profile.email,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        role: profile.role,
        shop_id: profile.shop_id
      })) as User[];
    },
  });

  const generatePinCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleCreateShop = async () => {
    if (!newShop.name.trim()) {
      toast.error('Le nom du magasin est requis');
      return;
    }

    setLoading(true);
    try {
      console.log('Creating shop:', newShop);
      
      try {
        const { data, error } = await supabase.rpc('create_shop_super_admin', {
          shop_name: newShop.name,
          shop_address: newShop.address || null,
        });

        if (error) throw error;
        console.log('Shop created via RPC:', data);
      } catch (rpcError) {
        console.log('RPC failed, using direct insert');
        
        const { data, error } = await supabase
          .from('shops')
          .insert({
            name: newShop.name,
            address: newShop.address || null,
            pin_code: generatePinCode()
          })
          .select()
          .single();

        if (error) throw error;
        console.log('Shop created via direct insert:', data);
      }

      toast.success('Magasin créé avec succès');
      setNewShop({ name: '', address: '' });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['super-admin-shops'] });
    } catch (error: any) {
      console.error('Error creating shop:', error);
      toast.error(error.message || 'Erreur lors de la création du magasin');
    } finally {
      setLoading(false);
    }
  };

  const handleEditShop = (shop: Shop) => {
    setEditingShop(shop);
    setIsEditDialogOpen(true);
  };

  const handleUpdateShop = async () => {
    if (!editingShop || !editingShop.name.trim()) {
      toast.error('Le nom du magasin est requis');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('shops')
        .update({
          name: editingShop.name,
          address: editingShop.address || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingShop.id);

      if (error) throw error;

      toast.success('Magasin mis à jour avec succès');
      setIsEditDialogOpen(false);
      setEditingShop(null);
      queryClient.invalidateQueries({ queryKey: ['super-admin-shops'] });
    } catch (error: any) {
      console.error('Error updating shop:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour du magasin');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAdmin = async () => {
    if (!selectedUser || !selectedShopForAdmin) {
      toast.error('Veuillez sélectionner un utilisateur et un magasin');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          shop_id: selectedShopForAdmin,
          role: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser);

      if (error) throw error;

      toast.success('Administrateur assigné avec succès');
      setSelectedUser('');
      setSelectedShopForAdmin('');
      setIsAssignAdminDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['unassigned-users'] });
    } catch (error: any) {
      console.error('Error assigning admin:', error);
      toast.error(error.message || 'Erreur lors de l\'assignation');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShop = async (shopId: string, shopName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le magasin "${shopName}" ?`)) {
      return;
    }

    try {
      console.log('Deleting shop:', shopId);
      const { error } = await supabase
        .from('shops')
        .delete()
        .eq('id', shopId);

      if (error) throw error;

      console.log('Shop deleted successfully');
      toast.success('Magasin supprimé avec succès');
      queryClient.invalidateQueries({ queryKey: ['super-admin-shops'] });
    } catch (error: any) {
      console.error('Error deleting shop:', error);
      toast.error(error.message || 'Erreur lors de la suppression du magasin');
    }
  };

  if (error) {
    console.error('Error in ShopManagement:', error);
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Erreur lors du chargement des magasins</p>
            <p className="text-sm text-gray-500 mt-2">
              {error instanceof Error ? error.message : 'Erreur inconnue'}
            </p>
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['super-admin-shops'] })}
              className="mt-4"
            >
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
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
          <h2 className="text-2xl font-bold">Gestion des Magasins</h2>
          <p className="text-gray-600">Créer, modifier et gérer tous les magasins</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isAssignAdminDialogOpen} onOpenChange={setIsAssignAdminDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Assigner Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assigner un administrateur à un magasin</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="user-select">Utilisateur</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un utilisateur" />
                    </SelectTrigger>
                    <SelectContent>
                      {unassignedUsers?.map((user) => (
                        <SelectItem key={user.user_id} value={user.user_id}>
                          {user.email} ({user.first_name} {user.last_name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="shop-select">Magasin</Label>
                  <Select value={selectedShopForAdmin} onValueChange={setSelectedShopForAdmin}>
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

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAssignAdminDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button onClick={handleAssignAdmin} disabled={loading}>
                    {loading ? 'Attribution...' : 'Assigner'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nouveau Magasin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouveau magasin</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="shop-name">Nom du magasin *</Label>
                  <Input
                    id="shop-name"
                    value={newShop.name}
                    onChange={(e) => setNewShop({ ...newShop, name: e.target.value })}
                    placeholder="Nom du magasin"
                  />
                </div>
                <div>
                  <Label htmlFor="shop-address">Adresse</Label>
                  <Textarea
                    id="shop-address"
                    value={newShop.address}
                    onChange={(e) => setNewShop({ ...newShop, address: e.target.value })}
                    placeholder="Adresse du magasin"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button onClick={handleCreateShop} disabled={loading}>
                    {loading ? 'Création...' : 'Créer'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Shop Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le magasin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-shop-name">Nom du magasin *</Label>
              <Input
                id="edit-shop-name"
                value={editingShop?.name || ''}
                onChange={(e) => setEditingShop(prev => prev ? { ...prev, name: e.target.value } : null)}
                placeholder="Nom du magasin"
              />
            </div>
            <div>
              <Label htmlFor="edit-shop-address">Adresse</Label>
              <Textarea
                id="edit-shop-address"
                value={editingShop?.address || ''}
                onChange={(e) => setEditingShop(prev => prev ? { ...prev, address: e.target.value } : null)}
                placeholder="Adresse du magasin"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button onClick={handleUpdateShop} disabled={loading}>
                {loading ? 'Mise à jour...' : 'Mettre à jour'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {shops && shops.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Store className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">Aucun magasin</h3>
              <p className="text-gray-600 mb-4">Créez votre premier magasin pour commencer</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un magasin
              </Button>
            </CardContent>
          </Card>
        ) : (
          shops?.map((shop) => (
            <Card key={shop.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Store className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{shop.name}</CardTitle>
                      <p className="text-sm text-gray-600">{shop.address || 'Adresse non spécifiée'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditShop(shop)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteShop(shop.id, shop.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Code PIN</p>
                    <p className="font-mono font-semibold">{shop.pin_code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ventes</p>
                    <p className="font-semibold">{shop.total_sales || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Revenus</p>
                    <p className="font-semibold">{Number(shop.total_revenue || 0).toLocaleString()} FCFA</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Créé le</p>
                    <p className="text-sm">{new Date(shop.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
