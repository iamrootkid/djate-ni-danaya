import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { createCategory } from "./utils/categoryOperations";
import { useToast } from "@/components/ui/use-toast";
import { useShopId } from "@/hooks/use-shop-id";
import { Category } from "@/types/category";

interface AddCategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// This function returns single result or null
function getCategoryResult(data: any): Category | null {
  if (!data || typeof data !== "object") return null;
  // Defensive check: basic fields
  if ("id" in data && "name" in data && "shop_id" in data) return data as Category;
  return null;
}

export const AddCategoryForm = ({
  open,
  onOpenChange,
}: AddCategoryFormProps) => {
  const { toast } = useToast();
  const { shopId } = useShopId();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: any) => {
    if (!shopId) {
      toast({
        title: "Erreur: Boutique non trouvée. Veuillez contacter le support.",
        variant: "destructive",
      });
      return;
    }

    const result = await createCategory({ ...data, shop_id: shopId });
    const cat = getCategoryResult(result);

    if (!cat) {
      toast({
        title: "Impossible d'ajouter la catégorie.",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: `La catégorie "${cat.name}" a été ajoutée.`,
      variant: "default"
    });

    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter une catégorie</DialogTitle>
          <DialogDescription>
            Ajouter une nouvelle catégorie à votre boutique
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              placeholder="Nom de la catégorie"
              className="col-span-3"
              {...register("name", { required: "Le nom est requis" })}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{String(errors.name.message)}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Description de la catégorie (optionnel)"
              className="col-span-3"
              {...register("description")}
            />
          </div>
          <Button type="submit">Ajouter</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
