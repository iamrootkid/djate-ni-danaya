
import React from "react";
import { TagsIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useShopId } from "@/hooks/use-shop-id";
import { CategoryFilterButton } from "./CategoryFilterButton";
import { CategoryAddDialog } from "./CategoryAddDialog";
import { CategoryFilterSkeleton } from "./CategoryFilterSkeleton";
import { useCategoriesQuery } from "@/hooks/use-categories-query";

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  isAdmin?: boolean;
}

export const CategoryFilter = ({ selectedCategory, onSelectCategory, isAdmin = false }: CategoryFilterProps) => {
  const isMobile = useIsMobile();
  const { shopId } = useShopId();
  
  const { data: categories, isLoading, refetch } = useCategoriesQuery(shopId);

  if (isLoading) {
    return <CategoryFilterSkeleton />;
  }

  // Dynamic gap size based on screen size
  const gapSize = isMobile ? 1 : 2;

  return (
    <div className={`flex flex-wrap gap-${gapSize} mb-4 items-center`}>
      <div className="flex items-center mr-2">
        <TagsIcon className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
        <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Catégories:</span>
      </div>
      
      <CategoryFilterButton
        id={null}
        name="Tous"
        selectedCategory={selectedCategory}
        onClick={() => onSelectCategory(null)}
        isAll={true}
      />
      
      {categories?.map((category) => (
        <CategoryFilterButton
          key={category.id}
          id={category.id}
          name={category.name}
          selectedCategory={selectedCategory}
          onClick={() => onSelectCategory(category.id)}
          showBadge={selectedCategory === category.id}
        />
      ))}

      {isAdmin && (
        <CategoryAddDialog 
          shopId={shopId} 
          onCategoryAdded={() => refetch()} 
        />
      )}
    </div>
  );
};
