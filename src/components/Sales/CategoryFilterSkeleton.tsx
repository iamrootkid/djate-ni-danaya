
import React from "react";

export const CategoryFilterSkeleton = () => {
  return (
    <div className="flex flex-wrap gap-2 mb-4 items-center">
      <div className="animate-pulse h-8 w-20 bg-gray-200 rounded"></div>
      <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
      <div className="animate-pulse h-8 w-28 bg-gray-200 rounded"></div>
    </div>
  );
};
