
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { useEffect } from "react";
import { startOfDay } from "date-fns";

interface ExpensesHeaderProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (dateRange: DateRange | undefined) => void;
  filterType: "all" | "daily" | "monthly";
  onFilterTypeChange: (filterType: "all" | "daily" | "monthly") => void;
}

export const ExpensesHeader = ({
  dateRange,
  onDateRangeChange,
  filterType,
  onFilterTypeChange,
}: ExpensesHeaderProps) => {
  // Initialize with today's date when filter type changes to daily
  useEffect(() => {
    if (filterType === "daily") {
      const today = startOfDay(new Date());
      onDateRangeChange({
        from: today,
        to: today,
      });
    }
  }, [filterType, onDateRangeChange]);

  return (
    <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dépenses</h1>
        <p className="text-muted-foreground">
          Gérer et suivre toutes les dépenses de l'entreprise
        </p>
      </div>
      <div className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:space-x-2 lg:space-y-0">
        <Select
          value={filterType}
          onValueChange={(value: "all" | "daily" | "monthly") => onFilterTypeChange(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sélectionner un filtre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Quotidien</SelectItem>
            <SelectItem value="monthly">Mensuel</SelectItem>
            <SelectItem value="all">Tous</SelectItem>
          </SelectContent>
        </Select>
        {filterType !== "all" && (
          <DatePickerWithRange
            date={dateRange || { from: new Date(), to: new Date() }}
            setDate={(newDateRange) => onDateRangeChange(newDateRange)}
          />
        )}
      </div>
    </div>
  );
};
