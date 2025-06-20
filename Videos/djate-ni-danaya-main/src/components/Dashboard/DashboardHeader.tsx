import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateFilter, UserRole } from "@/types/invoice";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Tableau de bord</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          {userRole === "admin" || userRole === "owner" ? "Vue d'ensemble de votre entreprise" : "Vue d'ensemble des ventes"}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Select
          value={dateFilter}
          onValueChange={(value: DateFilter) =>
            handleFilterChange(value)
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sélectionner la période" />
          </SelectTrigger>
          <SelectContent position="popper" className="w-full sm:w-[180px]">
            <SelectItem value="all">Toutes les données</SelectItem>
            <SelectItem value="daily">Aujourd'hui</SelectItem>
            <SelectItem value="yesterday">Hier</SelectItem>
            <SelectItem value="monthly">Ce mois</SelectItem>
          </SelectContent>
        </Select>
        {dateFilter !== "all" && (
          <div className="w-full sm:w-auto">
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
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </div>
  );
};
