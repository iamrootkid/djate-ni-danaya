import { useState } from "react";
import { useShopData } from "@/hooks/use-shop-data";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddPersonnelForm } from "@/components/Personnel/AddPersonnelForm";
import { PersonnelList } from "@/components/Personnel/PersonnelList";
import { useToast } from "@/components/ui/use-toast";

export default function Personnel() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const { useShopQuery, useShopMutation } = useShopData();

  // Fetch personnel for the current shop
  const { data: personnel, isLoading, refetch } = useShopQuery(
    ["staff"],
    "staff",
    {}
  );

  // Mutation for updating personnel
  const updateMutation = useShopMutation("staff", {
    onSuccess: () => {
      refetch();
      toast({
        title: "Success",
        description: "Personnel updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting personnel
  const deleteMutation = useShopMutation("staff", {
    onSuccess: () => {
      refetch();
      toast({
        title: "Success",
        description: "Personnel deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Personnel Management</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Personnel
        </Button>
      </div>

      <PersonnelList
        personnel={personnel || []}
        onUpdate={(id, data) => updateMutation.update(id, data)}
        onDelete={(id) => deleteMutation.remove(id)}
      />

      <AddPersonnelForm
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={() => {
          setIsAddDialogOpen(false);
          refetch();
        }}
      />
    </div>
  );
} 