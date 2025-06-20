import { Input } from "@/components/ui/input";

interface ImageUploadProps {
  image: File | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  existingImageUrl?: string;
}

export const ImageUpload = ({ image, onImageChange, existingImageUrl }: ImageUploadProps) => {
  return (
    <div>
      <label htmlFor="image" className="block text-sm font-medium mb-1">
        Product Image
      </label>
      <div className="flex items-center gap-2">
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={onImageChange}
          className="flex-1"
        />
        {image ? (
          <img
            src={URL.createObjectURL(image)}
            alt="Preview"
            className="w-12 h-12 object-cover rounded"
          />
        ) : existingImageUrl ? (
          <img
            src={existingImageUrl}
            alt="Current"
            className="w-12 h-12 object-cover rounded"
          />
        ) : null}
      </div>
    </div>
  );
};