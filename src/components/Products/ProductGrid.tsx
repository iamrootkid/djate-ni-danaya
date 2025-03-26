import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: any[];
  onEdit: (product: any) => void;
  onDelete: (product: any) => void;
}

export const ProductGrid = ({ products, onEdit, onDelete }: ProductGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {products?.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};