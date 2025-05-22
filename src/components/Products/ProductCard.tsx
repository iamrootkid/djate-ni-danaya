import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProductCardProps {
  product: any;
  onEdit: (product: any) => void;
  onDelete: (product: any) => void;
}

export const ProductCard = ({ product, onEdit, onDelete }: ProductCardProps) => {
  const handleDelete = async () => {
    try {
      if (product.image_url) {
        const imagePath = product.image_url.split('/').pop();
        await supabase.storage.from('products').remove([imagePath]);
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;

      toast.success('Produit supprimé avec succès');
      onDelete(product);
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      toast.error('Échec de la suppression du produit');
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="aspect-square relative bg-gray-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            {product.name}
          </div>
        )}
      </div>
      <CardContent className="p-4 md:p-4 flex flex-col gap-2 md:gap-2">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg md:text-lg text-[#222] dark:text-white truncate">{product.name}</h3>
          <div className="text-sm text-gray-500 dark:text-[#aaa]">
            {product.categories?.name && (
              <div>Catégorie: {product.categories.name}</div>
            )}
            {product.description && <div>{product.description}</div>}
          </div>
          <div className="text-sm flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
            <div>Prix: <span className="font-semibold">{product.price.toLocaleString()} F CFA</span></div>
            <div className="text-red-500">Stock: {product.stock}</div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              size="icon"
              className="p-3 md:p-2 rounded-lg md:rounded"
              onClick={() => onEdit(product)}
            >
              <Pencil className="h-5 w-5 md:h-4 md:w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="p-3 md:p-2 rounded-lg md:rounded"
              onClick={handleDelete}
            >
              <Trash2 className="h-5 w-5 md:h-4 md:w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};