import { useState, useCallback } from "react";
import { DateFilter } from "@/types/invoice";
import { subDays } from "date-fns";

export const useDashboardFilters = (onFilterChange?: () => void) => {
  const [dateFilter, setDateFilter] = useState<DateFilter>("daily");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const handleFilterChange = useCallback((filter: DateFilter) => {
    setIsLoading(true);
    setDateFilter(filter);
    if (filter === "yesterday") {
      setStartDate(subDays(new Date(), 1));
    }
    // For other filters, do not change startDate (user can pick)
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
