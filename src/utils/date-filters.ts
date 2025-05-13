
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays } from "date-fns";
import { DateFilter } from "@/types/invoice";

/**
 * Applies date filters to a Supabase query
 */
export const applyDateFilter = (query: any, dateFilter: DateFilter, startDate: Date) => {
  if (dateFilter === "daily") {
    const dayStart = startOfDay(startDate);
    const dayEnd = endOfDay(startDate);
    console.log("Daily filter dates:", {
      start: dayStart.toISOString(),
      end: dayEnd.toISOString()
    });
    return query
      .gte('created_at', dayStart.toISOString())
      .lte('created_at', dayEnd.toISOString());
  } else if (dateFilter === "yesterday") {
    const yesterday = subDays(startDate, 1);
    const dayStart = startOfDay(yesterday);
    const dayEnd = endOfDay(yesterday);
    console.log("Yesterday filter dates:", {
      start: dayStart.toISOString(),
      end: dayEnd.toISOString()
    });
    return query
      .gte('created_at', dayStart.toISOString())
      .lte('created_at', dayEnd.toISOString());
  } else if (dateFilter === "monthly") {
    const monthStart = startOfMonth(startDate);
    const monthEnd = endOfMonth(startDate);
    console.log("Monthly filter dates:", {
      start: monthStart.toISOString(),
      end: monthEnd.toISOString()
    });
    return query
      .gte('created_at', monthStart.toISOString())
      .lte('created_at', monthEnd.toISOString());
  }
  console.log("No date filter applied");
  return query;
};
