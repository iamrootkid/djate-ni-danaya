import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ProductForm } from "./ProductForm";
import { useShopId } from "@/hooks/use-shop-id";
import { safeInsert } from "@/utils/safeFilters";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const STORAGE_BUCKET = 'product-images';

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
  const [categoryId, setCategoryId] = useState("none");
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { shopId } = useShopId();

  const { data: categories } = useQuery({
    queryKey: ["categories", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .eq("shop_id", shopId as any) as any;
        
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
      setCategoryId(product.category_id || "none");
    }
  }, [product]);

  const validateImage = (file: File) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({
        title: "Error",
        description: "Please upload a valid image file (JPEG, PNG, or WebP)",
        variant: "destructive",
      });
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Error",
        description: "Image size should be less than 5MB",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateImage(file)) {
        setImage(file);
      }
    }
  };

  const deleteOldImage = async (imageUrl: string) => {
    try {
      const filePath = imageUrl.split('/').pop();
      if (!filePath) return;
      await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([`${shopId}/${filePath}`]);
    } catch (error) {
      console.error("Error in deleteOldImage:", error);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${shopId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        if (uploadError.message.includes('bucket not found')) {
          toast({
            title: "Error",
            description: "Storage bucket not configured. Please contact support.",
            variant: "destructive",
          });
          return null;
        }
        console.error("Error uploading image:", uploadError);
        throw new Error(uploadError.message || "Failed to upload image");
      }

      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("Error in uploadImage:", error);
      throw error;
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
        if (product.image_url) {
          await deleteOldImage(product.image_url);
        }

        try {
          imageUrl = await uploadImage(image);
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message || "Failed to upload image. Please try again.",
            variant: "destructive",
          });
          setUploading(false);
          return;
        }
      }

      const productData = { 
        name: name.trim(), 
        description: description.trim() || null, 
        price: Number(price), 
        stock: Number(stock),
        // Only set category_id if it's not "none"
        category_id: categoryId === "none" ? null : categoryId,
        image_url: imageUrl,
        shop_id: shopId
      } as any;

      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", product.id)
        .eq("shop_id", shopId as any) as any;

      if (error) {
        console.error("Error updating product:", error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Product updated successfully",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
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
