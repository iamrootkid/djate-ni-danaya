import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateFilter, UserRole } from "@/types/invoice";

interface DashboardHeaderProps {
  dateFilter: DateFilter;
  startDate: Date;
  handleFilterChange: (filter: DateFilter) => void;
  setStartDate: (date: Date) => void;
  userRole: UserRole;
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
          {userRole === "admin" || userRole === "owner" ? "Vue d'ensemble de votre entreprise" : "Vue d'ensemble des ventes"}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Select
          value={dateFilter}
          onValueChange={(value: DateFilter) =>
            handleFilterChange(value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sélectionner la période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les données</SelectItem>
            <SelectItem value="daily">Aujourd'hui</SelectItem>
            <SelectItem value="yesterday">Hier</SelectItem>
            <SelectItem value="monthly">Ce mois</SelectItem>
          </SelectContent>
        </Select>
        {dateFilter !== "all" && (
          <div className="hidden md:block">
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
          </div>
        )}
      </div>
    </div>
  );
};
