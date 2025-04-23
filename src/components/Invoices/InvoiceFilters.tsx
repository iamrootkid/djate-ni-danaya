import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

interface InvoiceFiltersProps {
  dateFilter: "all" | "daily" | "monthly";
  setDateFilter: (filter: "all" | "daily" | "monthly") => void;
  startDate: Date | null;
  setStartDate: (date: Date | null) => void;
  endDate: Date | null;
  setEndDate: (date: Date | null) => void;
}

export const InvoiceFilters = ({
  dateFilter,
  setDateFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: InvoiceFiltersProps) => {
  const handleFilterChange = (filter: "all" | "daily" | "monthly") => {
    setDateFilter(filter);
    
    if (filter === "all") {
      setStartDate(null);
      setEndDate(null);
    } else if (filter === "daily") {
      const today = new Date();
      setStartDate(today);
      setEndDate(null);
    } else if (filter === "monthly") {
      const today = new Date();
      setStartDate(today);
      setEndDate(null);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            <Button
              variant={dateFilter === "all" ? "default" : "outline"}
              onClick={() => handleFilterChange("all")}
            >
              All
            </Button>
            <Button
              variant={dateFilter === "daily" ? "default" : "outline"}
              onClick={() => handleFilterChange("daily")}
            >
              Daily
            </Button>
            <Button
              variant={dateFilter === "monthly" ? "default" : "outline"}
              onClick={() => handleFilterChange("monthly")}
            >
              Monthly
            </Button>
          </div>

          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Start Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate || undefined}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "End Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate || undefined}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};