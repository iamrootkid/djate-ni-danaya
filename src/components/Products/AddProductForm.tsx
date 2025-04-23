import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ProductForm } from "./ProductForm";
import { useShopId } from "@/hooks/use-shop-id";
import { safeInsert } from "@/utils/safeFilters";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const STORAGE_BUCKET = 'product-images';

export const AddProductForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isOpen, setIsOpen] = useState(false);
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
        .eq("shop_id", shopId) as any;
      if (error) throw error;
      return data;
    },
    enabled: !!shopId,
  });

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

  const validateForm = () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Product name is required",
        variant: "destructive",
      });
      return false;
    }
    if (!price || Number(price) <= 0) {
      toast({
        title: "Error",
        description: "Valid price is required",
        variant: "destructive",
      });
      return false;
    }
    if (!stock || Number(stock) < 0) {
      toast({
        title: "Error",
        description: "Valid stock quantity is required",
        variant: "destructive",
      });
      return false;
    }
    return true;
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
    
    if (!validateForm()) {
      return;
    }

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
      let imageUrl = null;

      if (image) {
        try {
          imageUrl = await uploadImage(image);
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message || "Failed to upload image",
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
        category_id: categoryId || null,
        image_url: imageUrl,
        shop_id: shopId
      };

      const { error } = await supabase
        .from("products")
        .insert(productData) as any;

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product added successfully",
      });

      setName("");
      setDescription("");
      setPrice("");
      setStock("");
      setCategoryId("");
      setImage(null);
      setIsOpen(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Ajouter Produit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter nouveau produit</DialogTitle>
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
          submitText="Add Product"
          categories={categories}
        />
      </DialogContent>
    </Dialog>
  );
};
