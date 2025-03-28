
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useShopData } from "@/hooks/use-shop-data";
import { useShopId } from "@/hooks/use-shop-id";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export const AddCategoryForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { useShopMutation } = useShopData();
  const { shopId } = useShopId();

  const { mutate } = useShopMutation("categories", {
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Catégorie ajoutée avec succès",
      });
      setName("");
      setDescription("");
      setIsOpen(false);
      onSuccess();
    },
    onError: (error: any) => {
      console.error("Erreur lors de l'ajout de la catégorie:", error);
      
      // Specific error message for duplicate category name
      if (error.code === "23505" && error.message.includes("categories_name_key")) {
        toast({
          title: "Erreur",
          description: "Une catégorie avec ce nom existe déjà dans ce magasin",
          variant: "destructive",
        });
      } else if (error.code === "23505" && error.message.includes("categories_name_shop_id_key")) {
        toast({
          title: "Erreur",
          description: "Une catégorie avec ce nom existe déjà dans ce magasin",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur",
          description: "Échec de l'ajout de la catégorie. " + (error.message || ""),
          variant: "destructive",
        });
      }
      
      setIsSubmitting(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de la catégorie est requis",
        variant: "destructive",
      });
      return;
    }

    if (!shopId) {
      toast({
        title: "Erreur",
        description: "ID du magasin manquant. Veuillez vous reconnecter.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await mutate({ 
        name: name.trim(), 
        description: description.trim() || null,
        shop_id: shopId  // Add the shop_id explicitly
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout de la catégorie:", error);
      // Error is handled in the onError callback
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!isSubmitting) {
        setIsOpen(open);
        if (!open) {
          setName("");
          setDescription("");
        }
      }
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Ajouter une catégorie
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle catégorie</DialogTitle>
          <DialogDescription>
            Créez une nouvelle catégorie pour organiser vos produits
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nom
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom de la catégorie"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de la catégorie (optionnel)"
              disabled={isSubmitting}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Ajout en cours..." : "Ajouter la catégorie"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
