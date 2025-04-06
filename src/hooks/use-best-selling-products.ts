
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BestSellingProduct } from "@/integrations/supabase/types/functions";
import { DateFilter } from "@/types/invoice";
import { format, subDays, startOfMonth } from "date-fns";

export const useBestSellingProducts = (dateFilter?: DateFilter, startDate?: Date) => {
  const shopId = localStorage.getItem("shopId") || "";
  
  // Calculate date range based on filter
  const calculateDateRange = () => {
    const today = new Date();
    let start = today;
    
    if (dateFilter === "daily") {
      start = startDate || today;
    } else if (dateFilter === "monthly") {
      start = startOfMonth(startDate || today);
    } else if (dateFilter === "yesterday") {
      start = subDays(today, 1);
    } else if (dateFilter === "all") {
      // For "all", we'll use null to indicate no date filtering
      return { startDateParam: null, endDateParam: null };
    }
    
    const startFormatted = format(start, "yyyy-MM-dd");
    const endFormatted = format(today, "yyyy-MM-dd");
    
    return {
      startDateParam: startFormatted,
      endDateParam: endFormatted
    };
  };

  const { startDateParam, endDateParam } = calculateDateRange();

  return useQuery<BestSellingProduct[]>({
    queryKey: ["bestSellingProducts", shopId, dateFilter, startDateParam, endDateParam],
    queryFn: async () => {
      if (!shopId) {
        return [];
      }

      console.log("Fetching best selling products with params:", {
        shop_id_param: shopId,
        start_date_param: startDateParam,
        end_date_param: endDateParam
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
