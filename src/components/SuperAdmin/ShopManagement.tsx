
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Store } from "lucide-react";
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

export const ShopManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newShop, setNewShop] = useState({ name: '', address: '' });
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: shops, isLoading } = useQuery({
    queryKey: ['super-admin-shops'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_all_shops');
      if (error) throw error;
      return data as Shop[];
    },
  });

  const handleCreateShop = async () => {
    if (!newShop.name.trim()) {
      toast.error('Le nom du magasin est requis');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('create_shop_super_admin', {
        shop_name: newShop.name,
        shop_address: newShop.address || null,
      });

      if (error) throw error;

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

  const handleDeleteShop = async (shopId: string, shopName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le magasin "${shopName}" ?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('shops')
        .delete()
        .eq('id', shopId);

      if (error) throw error;

      toast.success('Magasin supprimé avec succès');
      queryClient.invalidateQueries({ queryKey: ['super-admin-shops'] });
    } catch (error: any) {
      console.error('Error deleting shop:', error);
      toast.error(error.message || 'Erreur lors de la suppression du magasin');
    }
  };

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

      <div className="grid gap-4">
        {shops?.map((shop) => (
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
                  <Button variant="outline" size="sm">
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
                  <p className="font-semibold">{shop.total_sales}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Revenus</p>
                  <p className="font-semibold">{Number(shop.total_revenue).toLocaleString()} FCFA</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Créé le</p>
                  <p className="text-sm">{new Date(shop.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
