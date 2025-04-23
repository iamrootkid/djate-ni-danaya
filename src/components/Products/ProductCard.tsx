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
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">{product.name}</h3>
          <div className="text-sm text-gray-500">
            {product.categories?.name && (
              <div>Catégorie: {product.categories.name}</div>
            )}
            {product.description && <div>{product.description}</div>}
          </div>
          <div className="text-sm">
            <div>Prix: {product.price.toLocaleString()} F CFA</div>
            <div className="text-red-500">Stock: {product.stock}</div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(product)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};