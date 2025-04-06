
import { AppLayout } from "@/components/Layout/AppLayout";
import { ExpensesHeader } from "@/components/Expenses/ExpensesHeader";
import { ExpensesList } from "@/components/Expenses/ExpensesList";
import { ExpensesStats } from "@/components/Expenses/ExpensesStats";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { startOfMonth } from "date-fns";

const Expenses = () => {
  const [filterType, setFilterType] = useState<"all" | "daily" | "monthly">("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <ExpensesHeader
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          filterType={filterType}
          onFilterTypeChange={setFilterType}
        />
        <ExpensesStats filterType={filterType} dateRange={dateRange} />
        <ExpensesList filterType={filterType} dateRange={dateRange} />
      </div>
    </AppLayout>
  );
};

export default Expenses;
