import { AppLayout } from "@/components/Layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { PersonnelList } from "@/components/Personnel/PersonnelList";
import { AddPersonnelForm } from "@/components/Personnel/AddPersonnelForm";
import { useShopId } from "@/hooks/use-shop-id";
import { Database } from "@/types/supabase";

type PersonnelMember = Database["public"]["Tables"]["staff"]["Row"];

interface PersonnelEditData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  password?: string;
}

const Personnel = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<PersonnelMember | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { shopId } = useShopId();

  const handleDelete = async () => {
    if (!selectedPersonnel || !shopId) return;

    try {
      const { error } = await supabase
        .from("staff")
        .delete()
        .match({ id: selectedPersonnel.id, shop_id: shopId });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Personnel deleted successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ["personnel", shopId] });
      setDeleteDialogOpen(false);
      setSelectedPersonnel(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete personnel",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (data: PersonnelEditData) => {
    if (!selectedPersonnel || !shopId) return;

    try {
      const { error } = await supabase
        .from("staff")
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          ...(data.password && { password_hash: data.password }),
        })
        .match({ id: selectedPersonnel.id, shop_id: shopId });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Personnel updated successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ["personnel", shopId] });
      setEditDialogOpen(false);
      setSelectedPersonnel(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update personnel",
        variant: "destructive",
      });
    }
  };

  if (!shopId) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Please select a shop to manage personnel.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Personnel Management</h1>
          <AddPersonnelForm onSuccess={() => queryClient.invalidateQueries({ queryKey: ["personnel", shopId] })} />
        </div>
        <Card>
          <CardContent className="pt-6">
            <PersonnelList
              onEdit={(personnel) => {
                setSelectedPersonnel(personnel);
                setEditDialogOpen(true);
              }}
              onDelete={(personnel) => {
                setSelectedPersonnel(personnel);
                setDeleteDialogOpen(true);
              }}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Personnel; 