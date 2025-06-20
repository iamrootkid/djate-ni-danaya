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
import { Product } from "@/types/inventory";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useShopData } from "@/hooks/use-shop-data";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const shopId = localStorage.getItem("shopId");
  const { useShopQuery } = useShopData();
  const { data: categories = [] } = useShopQuery(
    ["categories"],
    "categories",
    { select: "id, name", enabled: true }
  );

  const { data: productsRaw, refetch, isLoading, error } = useQuery({
    queryKey: ["products", selectedCategory, shopId],
    queryFn: async () => {
      if (!shopId) {
        console.error("No shop ID found, user should be redirected to login");
        return [];
      }
      let query = supabase
        .from("products")
        .select(`*, categories ( name )`)
        .eq('shop_id', shopId as any);
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory as any);
      }
      const { data, error } = await query;
      if (error) {
        console.error("Error fetching products:", error);
        throw error;
      }
      return data || [];
    },
    enabled: !!shopId,
  });

  // Type guard to filter out error objects
  function isProduct(p: any): p is Product {
    return p && typeof p === 'object' && 'id' in p && 'name' in p;
  }
  // First, filter out only valid products
  const validProducts: Product[] = ((productsRaw || []) as any[]).filter(isProduct);
  // Then, apply the search filter
  const filteredProducts: Product[] = validProducts.filter(
    (product) => {
      const productName = product.name.toLowerCase();
      const categoryName = product.categories?.name?.toLowerCase() || "";
      const search = searchTerm.toLowerCase();
      return productName.includes(search) || categoryName.includes(search);
    }
  );

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      // First delete the image if it exists
      if (selectedProduct.image_url) {
        const imagePath = selectedProduct.image_url.split('/').pop();
        if (imagePath) {
          const { error: storageError } = await supabase.storage
            .from('products')
            .remove([imagePath]);
            
          if (storageError) {
            console.error('Error deleting image:', storageError);
          }
        }
      }
      
      // Then delete the product
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", selectedProduct.id as any);

      if (error) throw error;

      toast({
        title: "Success"
      });
      
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        variant: "destructive"
      });
    }
  };

  if (error) {
    console.error("Products query error:", error);
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold text-red-500">Error loading products</h2>
          <p className="text-gray-500 mt-2">Please try refreshing the page</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex gap-6 p-1">
        <div className="hidden md:block">
          <CategorySidebar
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold tracking-tight">Produits</h2>
            <Button onClick={() => setAddDialogOpen(true)}>
              Ajouter produit
            </Button>
          </div>

          {/* Mobile View */}
          <div className="md:hidden">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher des produits..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                {/* New Category Filter Design */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Filtrer par catégorie</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-primary"
                      onClick={() => setSelectedCategory(null)}
                    >
                      Tout effacer
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    <button
                      className={`flex items-center justify-center p-3 rounded-lg border transition-all ${
                        !selectedCategory 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'bg-card hover:bg-accent hover:text-accent-foreground border-border'
                      }`}
                      onClick={() => setSelectedCategory(null)}
                    >
                      <span className="text-sm font-medium">Tous</span>
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        className={`flex items-center justify-center p-3 rounded-lg border transition-all ${
                          selectedCategory === cat.id 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : 'bg-card hover:bg-accent hover:text-accent-foreground border-border'
                        }`}
                        onClick={() => setSelectedCategory(cat.id)}
                      >
                        <span className="text-sm font-medium truncate">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">Aucun produit trouvé</p>
                  </div>
                ) : (
                  <ProductGrid
                    products={filteredProducts as Product[]}
                    onEdit={(product) => {
                      setSelectedProduct(product);
                      setEditDialogOpen(true);
                    }}
                    onDelete={(product) => {
                      setSelectedProduct(product);
                      setDeleteDialogOpen(true);
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Desktop View */}
          <div className="hidden md:block">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher des produits..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                {/* New Category Filter Design */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Filtrer par catégorie</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-primary"
                      onClick={() => setSelectedCategory(null)}
                    >
                      Tout effacer
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    <button
                      className={`flex items-center justify-center p-3 rounded-lg border transition-all ${
                        !selectedCategory 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'bg-card hover:bg-accent hover:text-accent-foreground border-border'
                      }`}
                      onClick={() => setSelectedCategory(null)}
                    >
                      <span className="text-sm font-medium">Tous</span>
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        className={`flex items-center justify-center p-3 rounded-lg border transition-all ${
                          selectedCategory === cat.id 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : 'bg-card hover:bg-accent hover:text-accent-foreground border-border'
                        }`}
                        onClick={() => setSelectedCategory(cat.id)}
                      >
                        <span className="text-sm font-medium truncate">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                  </div>
                ) : filteredProducts?.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">Aucun produit trouvé</p>
                  </div>
                ) : (
                  <ProductGrid
                    products={filteredProducts as Product[]}
                    onEdit={(product) => {
                      setSelectedProduct(product);
                      setEditDialogOpen(true);
                    }}
                    onDelete={(product) => {
                      setSelectedProduct(product);
                      setDeleteDialogOpen(true);
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </div>
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

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un produit</DialogTitle>
          </DialogHeader>
          <AddProductForm />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Products;
