
import { useState, useCallback } from "react";
import { DateFilter } from "@/types/invoice";

export const useDashboardFilters = (onFilterChange?: () => void) => {
  const [dateFilter, setDateFilter] = useState<DateFilter>("daily");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const handleFilterChange = useCallback((filter: DateFilter) => {
    setIsLoading(true);
    setDateFilter(filter);
    
    // Only trigger the callback if provided
    if (onFilterChange) {
      onFilterChange();
    }
  }, [onFilterChange]);

  return {
    dateFilter,
    startDate,
    isLoading,
    setIsLoading,
    handleFilterChange,
    setStartDate
  };
};
