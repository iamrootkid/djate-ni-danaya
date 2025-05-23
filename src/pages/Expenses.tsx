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
      <div className={isMobile ? "space-y-4 p-2" : "space-y-6"}>
        <Card className={isMobile ? "bg-white dark:bg-[#18181b] rounded-xl shadow-sm" : undefined}>
          <CardContent className={isMobile ? "p-4" : "p-6"}>
            <div className={isMobile ? "flex flex-col gap-4" : "flex justify-between items-center"}>
              <div className={isMobile ? "w-full flex flex-col gap-2" : "flex items-center gap-4"}>
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
        <div className={isMobile ? "space-y-4" : undefined}>
          <Card className={isMobile ? "bg-white dark:bg-[#18181b] rounded-xl shadow-sm" : undefined}>
            <CardContent className={isMobile ? "p-4" : "p-6"}>
              <ExpensesStats filterType={filterType} dateRange={dateRange} />
            </CardContent>
          </Card>
          <Card className={isMobile ? "bg-white dark:bg-[#18181b] rounded-xl shadow-sm" : undefined}>
            <CardContent className={isMobile ? "p-4" : "p-6"}>
              <ExpensesList filterType={filterType} dateRange={dateRange} />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Expenses;
