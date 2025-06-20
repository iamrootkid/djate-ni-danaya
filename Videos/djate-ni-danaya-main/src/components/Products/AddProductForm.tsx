import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useShopId } from "@/hooks/use-shop-id";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";
import { isQueryError } from "@/utils/safeFilters";

interface Category {
  id: string;
  name: string;
}

export const AddProductForm = () => {
  const { shopId } = useShopId();
  const { toast } = useToast();
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("none");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      if (!shopId) return;
      
      setLoadingCategories(true);
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .eq("shop_id", shopId as any)
          .order("name");

        if (error) {
          console.error("Error fetching categories:", error);
          return;
        }

        setCategories((data as any) || []);
      } catch (error) {
        console.error("Error in categories fetch:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [shopId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopId) {
      toast({
        title: "Error",
        description: "Shop ID not found",
        variant: "destructive",
      });
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Validate numeric inputs
      const numericPrice = parseFloat(price);
      const numericStock = parseInt(stock, 10);

      if (isNaN(numericPrice) || numericPrice <= 0) {
        throw new Error("Please enter a valid price");
      }

      if (isNaN(numericStock) || numericStock < 0) {
        throw new Error("Please enter a valid stock quantity");
      }

      let uploadedImageUrl = imageUrl;
      // Handle image upload if a file is selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `product_${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, imageFile, { upsert: true });
        if (uploadError) {
          throw new Error("Image upload failed: " + uploadError.message);
        }
        // Get public URL
        const { data: publicUrlData } = supabase.storage.from('products').getPublicUrl(fileName);
        uploadedImageUrl = publicUrlData.publicUrl;
      }

      // Create product
      const productData = {
        name: productName,
        description: description,
        price: numericPrice,
        stock: numericStock,
        category_id: categoryId === "none" ? null : categoryId,
        shop_id: shopId,
        image_url: uploadedImageUrl || null,
      };

      const { data, error } = await supabase
        .from("products")
        .insert(productData as any)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Show success message
      toast({
        title: "Product Added",
        description: `${productName} has been added to inventory`,
      });

      // Reset form
      setProductName("");
      setDescription("");
      setPrice("");
      setStock("");
      setCategoryId("none");
      setImageUrl("");
      setImageFile(null);
      setImagePreview("");
    } catch (error: any) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="productName">Product Name *</Label>
            <Input
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter product name"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Prix *</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5">F CFA</span>
              <Input
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                type="number"
                step="0.01"
                min="0"
                className="pl-16"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Stock Quantity */}
          <div className="space-y-2">
            <Label htmlFor="stock">Stock Quantity *</Label>
            <Input
              id="stock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="0"
              type="number"
              min="0"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={categoryId}
              onValueChange={(value) => setCategoryId(value)}
              disabled={isSubmitting || loadingCategories}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Category</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter product description"
            disabled={isSubmitting}
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <Label htmlFor="productImage">Photo du produit</Label>
          <Input
            id="productImage"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isSubmitting}
          />
          {imagePreview && (
            <img src={imagePreview} alt="Aperçu" className="mt-2 h-24 rounded object-cover" />
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" disabled={isSubmitting}>
          <X className="mr-2 h-4 w-4" /> Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Check className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>
    </form>
  );
};
