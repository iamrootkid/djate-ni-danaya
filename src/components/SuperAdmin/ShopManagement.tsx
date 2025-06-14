
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Store } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const ShopManagement = () => {
  const [newShopName, setNewShopName] = useState("");
  const [newShopAddress, setNewShopAddress] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: shops, isLoading } = useQuery({
    queryKey: ['super-admin-shops'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_all_shops');
      if (error) throw error;
      return data;
    },
  });

  const createShopMutation = useMutation({
    mutationFn: async ({ name, address }: { name: string; address: string }) => {
      const { data, error } = await supabase.rpc('create_shop_super_admin', {
        shop_name: name,
        shop_address: address || null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Magasin créé avec succès! PIN: ${data[0].pin_code}`);
      setNewShopName("");
      setNewShopAddress("");
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['super-admin-shops'] });
    },
    onError: (error) => {
      console.error('Error creating shop:', error);
      toast.error("Erreur lors de la création du magasin");
    },
  });

  const handleCreateShop = () => {
    if (!newShopName.trim()) {
      toast.error("Le nom du magasin est requis");
      return;
    }
    createShopMutation.mutate({
      name: newShopName.trim(),
      address: newShopAddress.trim(),
    });
  };

  if (isLoading) {
    return <div>Chargement des magasins...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des magasins</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Créer un magasin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouveau magasin</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="shopName">Nom du magasin *</Label>
                <Input
                  id="shopName"
                  value={newShopName}
                  onChange={(e) => setNewShopName(e.target.value)}
                  placeholder="Ex: DJATE NI DANAYA - Bamako"
                />
              </div>
              <div>
                <Label htmlFor="shopAddress">Adresse</Label>
                <Input
                  id="shopAddress"
                  value={newShopAddress}
                  onChange={(e) => setNewShopAddress(e.target.value)}
                  placeholder="Ex: Rue 123, Bamako, Mali"
                />
              </div>
              <Button 
                onClick={handleCreateShop} 
                disabled={createShopMutation.isPending}
                className="w-full"
              >
                {createShopMutation.isPending ? "Création..." : "Créer le magasin"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shops?.map((shop) => (
          <Card key={shop.id}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store className="h-5 w-5 mr-2" />
                {shop.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <strong>PIN:</strong> {shop.pin_code}
                </div>
                {shop.address && (
                  <div>
                    <strong>Adresse:</strong> {shop.address}
                  </div>
                )}
                <div>
                  <strong>Ventes totales:</strong> {shop.total_sales}
                </div>
                <div>
                  <strong>Chiffre d'affaires:</strong> {formatCurrency(shop.total_revenue || 0)}
                </div>
                <div className="text-sm text-gray-600">
                  Créé le: {new Date(shop.created_at).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
