
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BestSellingProduct } from "@/integrations/supabase/types/functions";
import { format, subDays } from "date-fns";
import { DateFilter } from "@/types/invoice";
import { useShopId } from "./use-shop-id";

export const useBestSellingProducts = (dateFilter?: DateFilter, startDate?: Date) => {
  const { shopId } = useShopId();
  
  // Calculate date ranges based on filter
  const today = new Date();
  let startDateParam: string | undefined;
  let endDateParam: string | undefined;
  
  if (dateFilter === "daily") {
    const date = startDate || today;
    startDateParam = format(date, "yyyy-MM-dd");
    endDateParam = format(date, "yyyy-MM-dd");
  } else if (dateFilter === "monthly") {
    const date = startDate || today;
    startDateParam = format(new Date(date.getFullYear(), date.getMonth(), 1), "yyyy-MM-dd");
    endDateParam = format(new Date(date.getFullYear(), date.getMonth() + 1, 0), "yyyy-MM-dd");
  } else if (dateFilter === "yesterday") {
    const yesterday = subDays(today, 1);
    startDateParam = format(yesterday, "yyyy-MM-dd");
    endDateParam = format(yesterday, "yyyy-MM-dd");
  } else {
    // Default to last 30 days
    startDateParam = format(subDays(today, 30), "yyyy-MM-dd");
    endDateParam = format(today, "yyyy-MM-dd");
  }

  return useQuery<BestSellingProduct[]>({
    queryKey: ["bestSellingProducts", shopId, dateFilter, startDateParam, endDateParam],
    queryFn: async () => {
      if (!shopId) {
        return [];
      }

      console.log("Fetching best selling products with params:", {
        shop_id: shopId,
        startDate: startDateParam,
        endDate: endDateParam
      });

      const { data, error } = await supabase.rpc("get_best_selling_products", {
        shop_id_param: shopId,
        start_date_param: startDateParam,
        end_date_param: endDateParam
      });

      if (error) {
        console.error("Error fetching best selling products:", error);
        throw new Error(error.message);
      }

      return Array.isArray(data) ? data : [];
    },
    enabled: !!shopId,
  });
};
