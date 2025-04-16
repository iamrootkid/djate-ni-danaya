
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CategoryAddDialogProps {
  shopId: string | undefined;
  onCategoryAdded: () => void;
}

export const CategoryAddDialog = ({ shopId, onCategoryAdded }: CategoryAddDialogProps) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const iconSize = isMobile ? 'h-3 w-3' : 'h-4 w-4';
  
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de la catégorie est requis",
        variant: "destructive"
      });
      return;
    }
    
    if (!shopId) {
      toast({
        title: "Erreur",
        description: "Identifiant de magasin manquant",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .insert({
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim() || null,
          shop_id: shopId
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505" && (error.message.includes("categories_name_key") || error.message.includes("categories_name_shop_id_key"))) {
          throw new Error("Une catégorie avec ce nom existe déjà dans ce magasin");
        }
        throw error;
      }

      toast({
        title: "Succès",
        description: "Catégorie ajoutée avec succès",
        variant: "default"
      });

      // Reset form and close dialog
      setNewCategoryName("");
      setNewCategoryDescription("");
      setOpen(false);
      
      // Notify parent component about the new category
      onCategoryAdded();
      
    } catch (error: any) {
      console.error("Error adding category:", error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'ajout de la catégorie",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size={isMobile ? "sm" : "sm"}
          className={`${isMobile ? 'h-6' : 'h-8'} ${isMobile ? 'text-xs' : 'text-sm'} ${isMobile ? 'px-2' : ''}`}
        >
          <Plus className={iconSize} />
          {!isMobile && <span className="ml-1">Nouvelle</span>}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une catégorie</DialogTitle>
          <DialogDescription>
            Créez une nouvelle catégorie pour vos produits.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input 
              id="name" 
              placeholder="Nom de la catégorie" 
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea 
              id="description" 
              placeholder="Description de la catégorie"
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleAddCategory}
            disabled={isSubmitting || !newCategoryName.trim()}
          >
            {isSubmitting ? "En cours..." : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
