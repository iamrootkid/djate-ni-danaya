
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tag, TagsIcon, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useShopId } from "@/hooks/use-shop-id";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { isQueryError } from "@/utils/safeFilters";

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  isAdmin?: boolean;
}

export const CategoryFilter = ({ selectedCategory, onSelectCategory, isAdmin = false }: CategoryFilterProps) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { shopId } = useShopId();
  
  const { data: categories, isLoading, refetch } = useQuery({
    queryKey: ["categories", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("shop_id", shopId as any)
        .order("name") as any;
        
      if (error) throw error;
      return Array.isArray(data) 
        ? data.filter(cat => !isQueryError(cat)) 
        : [];
    },
    enabled: !!shopId,
  });

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
        } as any)
        .select()
        .single() as any;

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
      
      // Refetch categories
      refetch();
      
      // Select the newly created category
      if (data && !isQueryError(data) && data.id) {
        onSelectCategory(data.id);
      }
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

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <div className="animate-pulse h-8 w-20 bg-gray-200 rounded"></div>
        <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
        <div className="animate-pulse h-8 w-28 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // Dynamic gap size based on screen size
  const gapSize = isMobile ? 1 : 2;
  const buttonHeight = isMobile ? 'h-6' : 'h-8';
  const buttonTextSize = isMobile ? 'text-xs' : 'text-sm';
  const buttonPadding = isMobile ? 'px-2' : ''; // Default padding for non-mobile
  const iconSize = isMobile ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <div className={`flex flex-wrap gap-${gapSize} mb-4 items-center`}>
      <div className="flex items-center mr-2">
        <TagsIcon className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
        <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Catégories:</span>
      </div>
      
      <Button
        variant={selectedCategory === null ? "secondary" : "outline"}
        size={isMobile ? "sm" : "sm"}
        onClick={() => onSelectCategory(null)}
        className={`${buttonHeight} ${buttonTextSize} ${buttonPadding}`}
      >
        Tous
      </Button>
      
      {categories?.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "secondary" : "outline"}
          size={isMobile ? "sm" : "sm"}
          onClick={() => onSelectCategory(category.id)}
          className={`${buttonHeight} ${buttonTextSize} ${buttonPadding}`}
        >
          <Tag className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'} mr-1`} />
          {category.name}
          {selectedCategory === category.id && (
            <Badge className={`ml-1 ${isMobile ? 'h-4 px-1 text-[8px]' : 'h-5 px-1.5'}`} variant="secondary">
              {category.id.substring(0, 4)}
            </Badge>
          )}
        </Button>
      ))}

      {isAdmin && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "sm"}
              className={`${buttonHeight} ${buttonTextSize} ${buttonPadding}`}
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
      )}
    </div>
  );
};
