
import { AppLayout } from "@/components/Layout/AppLayout";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddProductForm } from "@/components/Products/AddProductForm";
import { ProductGrid } from "@/components/Products/ProductGrid";
import { CategorySidebar } from "@/components/Products/CategorySidebar";
import { EditProductDialog } from "@/components/Products/EditProductDialog";
import { DeleteProductDialog } from "@/components/Products/DeleteProductDialog";
import { useToast } from "@/hooks/use-toast";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const shopId = localStorage.getItem("shopId");

  const { data: products, refetch } = useQuery({
    queryKey: ["products", selectedCategory, shopId],
    queryFn: async () => {
      if (!shopId) {
        console.error("No shop ID found, user should be redirected to login");
        return [];
      }
      
      let query = supabase
        .from("products")
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('shop_id', shopId);
      
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!shopId,
  });

  const filteredProducts = products?.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categories?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      // First delete the image if it exists
      if (selectedProduct.image_url) {
        const imagePath = selectedProduct.image_url.split('/').pop();
        const { error: storageError } = await supabase.storage
          .from('products')
          .remove([imagePath]);
          
        if (storageError) {
          console.error('Error deleting image:', storageError);
        }
      }
      
      // Then delete the product
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", selectedProduct.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <div className="flex gap-6">
        <CategorySidebar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold tracking-tight">Products</h2>
            <AddProductForm onSuccess={() => refetch()} />
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <ProductGrid
                products={filteredProducts}
                onEdit={(product) => {
                  setSelectedProduct(product);
                  setEditDialogOpen(true);
                }}
                onDelete={(product) => {
                  setSelectedProduct(product);
                  setDeleteDialogOpen(true);
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <EditProductDialog
        product={selectedProduct}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["products"] });
          setEditDialogOpen(false);
        }}
      />

      <DeleteProductDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </AppLayout>
  );
};

export default Products;
