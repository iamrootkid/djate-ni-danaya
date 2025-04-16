
import React from "react";
import { Button } from "@/components/ui/button";
import { Tag, Badge } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CategoryFilterButtonProps {
  id: string | null;
  name: string;
  selectedCategory: string | null;
  onClick: () => void;
  isAll?: boolean;
  showBadge?: boolean;
}

export const CategoryFilterButton = ({ 
  id, 
  name, 
  selectedCategory, 
  onClick, 
  isAll = false,
  showBadge = false
}: CategoryFilterButtonProps) => {
  const isMobile = useIsMobile();
  const buttonHeight = isMobile ? 'h-6' : 'h-8';
  const buttonTextSize = isMobile ? 'text-xs' : 'text-sm';
  const buttonPadding = isMobile ? 'px-2' : ''; // Default padding for non-mobile
  const iconSize = isMobile ? 'h-2 w-2' : 'h-3 w-3';
  
  const isSelected = isAll ? selectedCategory === null : selectedCategory === id;
  
  return (
    <Button
      variant={isSelected ? "secondary" : "outline"}
      size={isMobile ? "sm" : "sm"}
      onClick={onClick}
      className={`${buttonHeight} ${buttonTextSize} ${buttonPadding}`}
    >
      {!isAll && <Tag className={`${iconSize} mr-1`} />}
      {name}
      {showBadge && id && (
        <Badge className={`ml-1 ${isMobile ? 'h-4 px-1 text-[8px]' : 'h-5 px-1.5'}`} variant="secondary">
          {id.substring(0, 4)}
        </Badge>
      )}
    </Button>
  );
};
