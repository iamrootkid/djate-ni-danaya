import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ProductForm } from "./ProductForm";

interface EditProductDialogProps {
  product: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditProductDialog = ({ 
  product, 
  open, 
  onOpenChange,
  onSuccess 
}: EditProductDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const shopId = localStorage.getItem("shopId");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!shopId) return [];
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .eq("shop_id", shopId);
      if (error) throw error;
      return data;
    },
    enabled: !!shopId,
  });

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description || "");
      setPrice(product.price.toString());
      setStock(product.stock.toString());
      setCategoryId(product.category_id || "");
    }
  }, [product]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopId) {
      toast({
        title: "Error",
        description: "No shop ID found",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      let imageUrl = product.image_url;

      if (image) {
        // Delete old image if it exists
        if (product.image_url) {
          const oldImagePath = product.image_url.split('/').pop();
          await supabase.storage
            .from('products')
            .remove([oldImagePath]);
        }

        const fileExt = image.name.split('.').pop();
        const filePath = `${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { error } = await supabase
        .from("products")
        .update({ 
          name, 
          description, 
          price: Number(price), 
          stock: Number(stock),
          category_id: categoryId,
          image_url: imageUrl,
          shop_id: shopId
        })
        .eq("id", product.id)
        .eq("shop_id", shopId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product updated successfully",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <ProductForm
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          price={price}
          setPrice={setPrice}
          stock={stock}
          setStock={setStock}
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          image={image}
          onImageChange={handleImageChange}
          onSubmit={handleSubmit}
          uploading={uploading}
          submitText="Save Changes"
          categories={categories}
          existingImageUrl={product?.image_url}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};