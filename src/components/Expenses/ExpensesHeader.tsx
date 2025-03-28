
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AddExpenseDialog } from "./AddExpenseDialog";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExpensesHeaderProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  filterType: "all" | "daily" | "monthly";
  onFilterTypeChange: (type: "all" | "daily" | "monthly") => void;
}

export const ExpensesHeader = ({
  dateRange,
  onDateRangeChange,
  filterType,
  onFilterTypeChange,
}: ExpensesHeaderProps) => {
  const [showAddDialog, setShowAddDialog] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dépenses</h2>
          <p className="text-muted-foreground">
            Gérez les dépenses de votre entreprise
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nouvelle dépense
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <Select value={filterType} onValueChange={(value: "all" | "daily" | "monthly") => onFilterTypeChange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sélectionner une période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les dépenses</SelectItem>
            <SelectItem value="daily">Journalier</SelectItem>
            <SelectItem value="monthly">Mensuel</SelectItem>
          </SelectContent>
        </Select>

        {filterType !== "all" && (
          <DatePickerWithRange
            date={dateRange || { from: undefined, to: undefined }}
            setDate={onDateRangeChange}
          />
        )}
      </div>

      <AddExpenseDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  );
};
