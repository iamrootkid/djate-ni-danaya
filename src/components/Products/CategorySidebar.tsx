import { Button } from "@/components/ui/button";
import { useShopData } from "@/hooks/use-shop-data";
import { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Tables"]["categories"]["Row"];

interface CategorySidebarProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export const CategorySidebar = ({ selectedCategory, onSelectCategory }: CategorySidebarProps) => {
  const { useShopQuery } = useShopData();

  const { data: categories } = useShopQuery(
    ["categories"],
    "categories",
    {
      select: "id, name",
      enabled: true
    }
  );

  return (
    <div className="w-64 bg-gray-100 p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Categories</h2>
      <div className="space-y-2">
        <Button
          variant={selectedCategory === null ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() => onSelectCategory(null)}
        >
          Tout les Produits
        </Button>
        {categories?.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => onSelectCategory(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
};