
import { supabase } from "@/integrations/supabase/client";
import { isValid } from "date-fns";
import { InvoiceData, DateFilter } from "@/types/invoice";
import { applyDateFilter, processInvoiceData } from "@/utils/invoiceUtils";

interface FetchInvoiceOptions {
  shopId: string;
  dateFilter: DateFilter;
  startDate: Date;
}

// Core function to fetch invoices with customer_phone
export const fetchInvoicesWithPhone = async ({ 
  shopId, 
  dateFilter, 
  startDate 
}: FetchInvoiceOptions): Promise<InvoiceData[]> => {
  console.log("Fetching invoices with phone for shop:", shopId, "with filter:", dateFilter);
  
  try {
    let query = supabase
      .from("invoices")
      .select(`
        id,
        invoice_number,
        customer_name,
        customer_phone,
        created_at,
        sale_id,
        shop_id,
        sales!inner (
          total_amount,
          shop_id,
          employee:profiles!inner (
            email
          )
        )
      `)
      .eq("shop_id", shopId)
      .eq("sales.shop_id", shopId);
    
    // Apply date filtering
    query = applyDateFilter(query, dateFilter, startDate);
    
    // Always order by most recent and limit to 5 results
    query = query.order("created_at", { ascending: false }).limit(5);

    const { data, error } = await query;

    if (error) {
      // Check if the error is about the customer_phone column
      if (error.message && error.message.includes("customer_phone")) {
        console.log("customer_phone column does not exist, retrying without it");
        return fetchInvoicesWithoutPhone({ shopId, dateFilter, startDate });
      } else {
        console.error("Error fetching invoices:", error);
        throw error;
      }
    }

    if (!data || data.length === 0) {
      console.log("No invoices found for shop:", shopId, "with filter:", dateFilter);
      return [];
    }

    console.log(`Found ${data.length} invoices for shop:`, shopId);
    return processInvoiceData(data, shopId);
  } catch (error) {
    console.error("Error in fetchInvoicesWithPhone:", error);
    throw error;
  }
};

// Fallback function to fetch invoices without customer_phone
export const fetchInvoicesWithoutPhone = async ({ 
  shopId, 
  dateFilter, 
  startDate 
}: FetchInvoiceOptions): Promise<InvoiceData[]> => {
  console.log("Fetching invoices without phone for shop:", shopId);
  
  try {
    let query = supabase
      .from("invoices")
      .select(`
        id,
        invoice_number,
        customer_name,
        created_at,
        sale_id,
        shop_id,
        sales!inner (
          total_amount,
          shop_id,
          employee:profiles!inner (
            email
          )
        )
      `)
      .eq("shop_id", shopId)
      .eq("sales.shop_id", shopId);
    
    // Apply date filtering
    query = applyDateFilter(query, dateFilter, startDate);
    
    // Always order by most recent and limit to 5 results
    query = query.order("created_at", { ascending: false }).limit(5);
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching invoices (without phone):", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log("No invoices found for shop:", shopId, "with filter:", dateFilter);
      return [];
    }
    
    console.log(`Found ${data.length} invoices for shop:`, shopId);
    return processInvoiceData(data, shopId);
  } catch (error) {
    console.error("Error in fetchInvoicesWithoutPhone:", error);
    throw error;
  }
};

// Verify user has access to this shop
export const verifyShopAccess = async (shopId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("No authenticated user found");
      return false;
    }

    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("shop_id")
      .eq("id", user.id)
      .single();

    if (profileError || !userProfile || userProfile.shop_id !== shopId) {
      console.error("User does not have access to this shop:", {
        userId: user.id,
        shopId,
        profileShopId: userProfile?.shop_id
      });
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error verifying shop access:", error);
    return false;
  }
};

// Main function to fetch invoices with proper validation
export const fetchInvoices = async ({ 
  shopId, 
  dateFilter, 
  startDate 
}: FetchInvoiceOptions): Promise<InvoiceData[]> => {
  if (!shopId) {
    console.log("No shop ID available for fetching invoices");
    return [];
  }

  if (!isValid(startDate)) {
    console.error("Invalid start date provided:", startDate);
    return [];
  }

  // Verify the current user has access to this shop
  const hasAccess = await verifyShopAccess(shopId);
  if (!hasAccess) {
    return [];
  }

  try {
    return await fetchInvoicesWithPhone({ shopId, dateFilter, startDate });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }
};
