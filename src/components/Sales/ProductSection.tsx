
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Product } from "@/types/sales";
import { ProductList } from "@/components/Sales/ProductList";
import { CategoryFilter } from "@/components/Sales/CategoryFilter";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProductSectionProps {
  products: Product[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  addToCart: (product: Product) => void;
  categoryName?: string | null;
  isAdmin: boolean;
}

export const ProductSection = ({
  products,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  addToCart,
  categoryName,
  isAdmin
}: ProductSectionProps) => {
  const isMobile = useIsMobile();
  
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className={`${isMobile ? 'mb-4' : ''}`}>
      <CardHeader className={`${isMobile ? 'py-3 px-4' : ''}`}>
        <CardTitle className={`${isMobile ? 'text-lg' : ''}`}>Produits</CardTitle>
      </CardHeader>
      <CardContent className={`${isMobile ? 'p-3' : ''}`}>
        <div className="relative mb-3">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher des produits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <CategoryFilter 
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          isAdmin={isAdmin}
        />
        
        <ProductList 
          products={filteredProducts || []} 
          addToCart={addToCart} 
          categoryName={categoryName}
        />
      </CardContent>
    </Card>
  );
};
