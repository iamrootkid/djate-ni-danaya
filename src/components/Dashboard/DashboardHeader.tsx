import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DashboardHeaderProps {
  dateFilter: "all" | "daily" | "monthly";
  startDate: Date;
  handleFilterChange: (filter: "all" | "daily" | "monthly") => void;
  setStartDate: (date: Date) => void;
  userRole: "admin" | "employee";
}

export const DashboardHeader = ({
  dateFilter,
  startDate,
  handleFilterChange,
  setStartDate,
  userRole,
}: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          {userRole === "admin" ? "Vue d'ensemble de votre entreprise" : "Vue d'ensemble des ventes"}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Select
          value={dateFilter}
          onValueChange={(value: "all" | "daily" | "monthly") =>
            handleFilterChange(value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sélectionner la période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les données</SelectItem>
            <SelectItem value="daily">Quotidien</SelectItem>
            <SelectItem value="monthly">Mensuel</SelectItem>
          </SelectContent>
        </Select>
        {dateFilter !== "all" && (
          <DatePickerWithRange
            date={{
              from: startDate,
              to: startDate,
            }}
            setDate={(date) => {
              if (date?.from) {
                setStartDate(date.from);
              }
            }}
          />
        )}
      </div>
    </div>
  );
};