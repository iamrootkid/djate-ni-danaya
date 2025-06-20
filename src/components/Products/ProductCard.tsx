import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Package, Tag, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: any;
  onEdit: (product: any) => void;
  onDelete: (product: any) => void;
  maxStock?: number;
}

export const ProductCard = ({ product, onEdit, onDelete, maxStock = 1 }: ProductCardProps) => {
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

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Rupture", variant: "destructive" as const };
    if (stock < 5) return { label: "Stock bas", variant: "warning" as const };
    return { label: "En stock", variant: "success" as const };
  };

  const stockStatus = getStockStatus(product.stock);

  // Remove proportional bar logic
  let barColor = 'bg-green-500';
  let stockLabel = 'En stock';
  if (product.stock === 0) {
    barColor = 'bg-red-500';
    stockLabel = 'Rupture';
  } else if (product.stock < 5) {
    barColor = 'bg-yellow-400';
    stockLabel = 'Stock bas';
  }

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]">
      <div className="aspect-square relative bg-muted overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <Package className="w-12 h-12 opacity-50" />
          </div>
        )}
      </div>
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-2">
          <div>
            <h3 className="font-semibold text-base sm:text-lg text-card-foreground truncate mb-1">{product.name}</h3>
            {product.categories?.name && (
              <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                <Tag className="w-3 h-3 mr-1" />
                <span className="truncate">{product.categories.name}</span>
              </div>
            )}
          </div>
          {product.description && (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{product.description}</p>
          )}
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-1">
              <div className="text-sm font-medium text-card-foreground">
                {product.price.toLocaleString()} F CFA
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-primary hover:text-primary-foreground"
                onClick={() => onEdit(product)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-destructive hover:text-destructive-foreground"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">Stock: {product.stock} unités</span>
            </div>
            <div className="w-full h-6 relative">
              <div className="absolute inset-0 w-full h-6 bg-gray-200 rounded-full" />
              <div
                className={`h-6 rounded-full flex items-center justify-center font-semibold text-xs text-white ${barColor}`}
                style={{ width: '100%', position: 'relative', zIndex: 1 }}
              >
                {stockLabel}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};