import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ProductForm } from "./ProductForm";

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
      let imageUrl = null;

      if (image) {
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
        .insert([{ 
          name, 
          description, 
          price: Number(price), 
          stock: Number(stock),
          category_id: categoryId,
          image_url: imageUrl,
          shop_id: shopId
        }]);

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
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add product",
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