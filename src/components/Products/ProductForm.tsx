
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "./ImageUpload";
import { Button } from "@/components/ui/button";
import { isQueryError } from "@/utils/safeFilters";

interface ProductFormProps {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  price: string;
  setPrice: (price: string) => void;
  stock: string;
  setStock: (stock: string) => void;
  categoryId: string;
  setCategoryId: (categoryId: string) => void;
  image: File | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  uploading: boolean;
  submitText: string;
  categories?: any[];
  existingImageUrl?: string;
  onCancel?: () => void;
}

export const ProductForm = ({
  name,
  setName,
  description,
  setDescription,
  price,
  setPrice,
  stock,
  setStock,
  categoryId,
  setCategoryId,
  image,
  onImageChange,
  onSubmit,
  uploading,
  submitText,
  categories,
  existingImageUrl,
  onCancel,
}: ProductFormProps) => {
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setPrice(value);
    }
  };

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*$/.test(value)) {
      setStock(value);
    }
  };

  // Filter out any categories that might be error objects
  const validCategories = categories?.filter(category => !isQueryError(category)) || [];

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <ImageUpload
        image={image}
        onImageChange={onImageChange}
        existingImageUrl={existingImageUrl}
      />
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name *
        </label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Enter product name"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter product description"
        />
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-1">
          Category
        </label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {validCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label htmlFor="price" className="block text-sm font-medium mb-1">
          Price (F CFA) *
        </label>
        <Input
          id="price"
          type="text"
          value={price}
          onChange={handlePriceChange}
          required
          placeholder="0.00"
          min="0"
          step="0.01"
        />
      </div>
      <div>
        <label htmlFor="stock" className="block text-sm font-medium mb-1">
          Stock *
        </label>
        <Input
          id="stock"
          type="text"
          value={stock}
          onChange={handleStockChange}
          required
          placeholder="0"
          min="0"
        />
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : submitText}
        </Button>
      </div>
    </form>
  );
};
