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
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

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
        content: "Personnel deleted successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ["personnel", shopId] });
      setDeleteDialogOpen(false);
      setSelectedPersonnel(null);
    } catch (error: any) {
      toast({
        title: "Error",
        content: error.message || "Failed to delete personnel",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (data: PersonnelEditData) => {
    if (!selectedPersonnel || !shopId) return;

    try {
      const updateData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        ...(data.password && { password_hash: data.password }),
      } as any;

      const { error } = await supabase
        .from("staff")
        .update(updateData)
        .match({ id: selectedPersonnel.id, shop_id: shopId });

      if (error) throw error;

      toast({
        title: "Success",
        content: "Personnel updated successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ["personnel", shopId] });
      setEditDialogOpen(false);
      setSelectedPersonnel(null);
    } catch (error: any) {
      toast({
        title: "Error",
        content: error.message || "Failed to update personnel",
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
      <div className={isMobile ? "space-y-4 p-2 flex flex-col items-center" : "space-y-6 flex flex-col items-center"}>
        <Card className={isMobile ? "bg-white dark:bg-[#18181b] rounded-xl shadow-sm w-full max-w-md mx-auto" : "bg-white dark:bg-[#18181b] rounded-xl shadow-sm w-full max-w-2xl mx-auto"}>
          <CardContent className={isMobile ? "p-4" : undefined}>
            <div className={isMobile ? "flex flex-col gap-4" : "flex justify-between items-center"}>
              <h1 className="text-2xl font-bold text-foreground">Personnel Management</h1>
              <Button 
                onClick={() => setEditDialogOpen(true)}
                className={isMobile ? "w-full bg-[#a18afc] hover:bg-[#a18afc]/90 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2" : "bg-[#a18afc] hover:bg-[#a18afc]/90 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2"}
              >
                <Plus className="h-5 w-5" />
                Add Personnel
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className={isMobile ? "bg-white dark:bg-[#18181b] rounded-xl shadow-sm w-full max-w-md mx-auto" : "bg-white dark:bg-[#18181b] rounded-xl shadow-sm w-full max-w-2xl mx-auto"}>
          <CardContent className="p-0">
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