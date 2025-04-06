
import { useState, useCallback } from "react";
import { DateFilter } from "@/types/invoice";

export const useDashboardFilters = (onFilterChange?: () => void) => {
  const [dateFilter, setDateFilter] = useState<DateFilter>("daily");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  
  const handleFilterChange = useCallback((filter: DateFilter) => {
    setIsLoading(true);
    setDateFilter(filter);
    const today = new Date();
    
    if (filter === "all") {
      setStartDate(today);
    } else if (filter === "daily") {
      setStartDate(today);
    } else if (filter === "monthly") {
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(firstDayOfMonth);
    } else if (filter === "yesterday") {
      setStartDate(today); // The yesterday filter will calculate yesterday based on today
    }

    // Call the optional callback if provided
    if (onFilterChange) {
      setTimeout(() => {
        onFilterChange();
      }, 100);
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
