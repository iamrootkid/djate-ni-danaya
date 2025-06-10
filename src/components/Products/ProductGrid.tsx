import { ProductCard } from "./ProductCard";
import { Product } from "@/types/inventory";

interface ProductGridProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductGrid = ({ products, onEdit, onDelete }: ProductGridProps) => {
  const maxStock = products.length > 0 ? Math.max(...products.map(p => p.stock)) : 1;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
          maxStock={maxStock}
        />
      ))}
    </div>
  );
};
