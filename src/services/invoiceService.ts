
import { supabase } from "@/integrations/supabase/client";
import { applyDateFilter, processInvoiceData } from "@/utils/invoiceUtils";
import { DateRange } from "react-day-picker";
import { startOfDay, endOfDay } from "date-fns";

export const fetchInvoices = async (
  shopId: string | null,
  page: number = 1,
  limit: number = 10,
  sortBy: string = "created_at",
  sortOrder: "asc" | "desc" = "desc",
  dateRange?: DateRange,
  searchTerm?: string
) => {
  if (!shopId) return { data: [], count: 0 };

  try {
    // Start query
    let query = supabase
      .from("invoices")
      .select(
        `
        *,
        sales (
          total_amount,
          customer_name,
          customer_phone,
          employee_id
        )
      `,
        { count: "exact" }
      )
      .eq("shop_id", shopId);

    // Apply date filter if provided
    if (dateRange && dateRange.from) {
      const fromDate = startOfDay(dateRange.from);
      const toDate = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
      
      query = query
        .gte("created_at", fromDate.toISOString())
        .lte("created_at", toDate.toISOString());
    }

    // Apply search term if provided
    if (searchTerm) {
      query = query
        .or(
          `customer_name.ilike.%${searchTerm}%,invoice_number.ilike.%${searchTerm}%`
        );
    }

    // Pagination and sorting
    const { data, error, count } = await query
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    return { 
      data: processInvoiceData(data || []), 
      count: count || 0 
    };
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return { data: [], count: 0 };
  }
};

export const fetchInvoice = async (id: string, shopId: string | null) => {
  if (!shopId) return null;

  try {
    const { data, error } = await supabase
      .from("invoices")
      .select(
        `
        *,
        sales (
          total_amount,
          employee_id,
          customer_name,
          customer_phone,
          sale_items (
            id,
            product_id,
            quantity,
            price_at_sale,
            returned_quantity,
            products (
              name
            )
          )
        )
      `
      )
      .eq("id", id)
      .eq("shop_id", shopId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return null;
  }
};
