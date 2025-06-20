import { AppLayout } from "@/components/Layout/AppLayout";
import { ExpensesHeader } from "@/components/Expenses/ExpensesHeader";
import { ExpensesList } from "@/components/Expenses/ExpensesList";
import { ExpensesStats } from "@/components/Expenses/ExpensesStats";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { startOfMonth } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";

const Expenses = () => {
  const [filterType, setFilterType] = useState<"all" | "daily" | "monthly">("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });
  const isMobile = useIsMobile();

  return (
    <AppLayout>
      <div className="space-y-6 p-4 md:p-6">
        <Card className="bg-white dark:bg-[#18181b] rounded-xl shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
              <div className="w-full flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                <ExpensesHeader
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                  filterType={filterType}
                  onFilterTypeChange={setFilterType}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-white dark:bg-[#18181b] rounded-xl shadow-sm">
            <CardContent className="p-4 md:p-6">
              <ExpensesStats filterType={filterType} dateRange={dateRange} />
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-[#18181b] rounded-xl shadow-sm">
            <CardContent className="p-4 md:p-6">
              <ExpensesList filterType={filterType} dateRange={dateRange} />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Expenses;
