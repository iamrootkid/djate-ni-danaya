
import { InvoiceData } from "@/types/invoice";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

// Helper function to create an InvoiceData object with null-safety
export const createInvoiceData = (
  invoice: any, 
  sale: { total_amount: number; shop_id: string; employee?: { email: string } | null }
): InvoiceData | null => {
  // Skip this invoice if it's null or not an object
  if (!invoice || typeof invoice !== 'object') {
    console.warn("Invoice is null or not an object");
    return null;
  }
  
  // Skip this invoice if it's missing required fields
  if (!invoice.id || !invoice.invoice_number || !invoice.created_at || !invoice.sale_id) {
    console.warn("Invoice missing required fields:", invoice);
    return null;
  }

  const result: InvoiceData = {
    id: invoice.id,
    invoice_number: invoice.invoice_number,
    customer_name: invoice.customer_name || "Client inconnu",
    customer_phone: invoice.customer_phone || undefined,
    created_at: invoice.created_at,
    total_amount: sale.total_amount || 0,
    sale_id: invoice.sale_id,
    employee_email: sale.employee?.email || "Email inconnu"
  };
  
  return result;
};

// Helper to apply date filters to a query
export const applyDateFilter = (query: any, dateFilter: string, startDate: Date) => {
  if (dateFilter === "daily") {
    const dayStart = startOfDay(startDate);
    const dayEnd = endOfDay(startDate);
    console.log("Daily filter dates:", {
      start: dayStart.toISOString(),
      end: dayEnd.toISOString()
    });
    return query
      .gte("invoices.created_at", dayStart.toISOString())
      .lte("invoices.created_at", dayEnd.toISOString());
  } else if (dateFilter === "yesterday") {
    const yesterday = subDays(startDate, 1);
    const dayStart = startOfDay(yesterday);
    const dayEnd = endOfDay(yesterday);
    console.log("Yesterday filter dates:", {
      start: dayStart.toISOString(),
      end: dayEnd.toISOString()
    });
    return query
      .gte("invoices.created_at", dayStart.toISOString())
      .lte("invoices.created_at", dayEnd.toISOString());
  } else if (dateFilter === "monthly") {
    const monthStart = startOfMonth(startDate);
    const monthEnd = endOfMonth(startDate);
    console.log("Monthly filter dates:", {
      start: monthStart.toISOString(),
      end: monthEnd.toISOString()
    });
    return query
      .gte("invoices.created_at", monthStart.toISOString())
      .lte("invoices.created_at", monthEnd.toISOString());
  } else {
    console.log("Fetching all invoices (no date filter)");
    return query;
  }
};

// Helper to process invoice data
export const processInvoiceData = (invoiceData: any[] | null, shopId: string): InvoiceData[] => {
  if (!invoiceData || !Array.isArray(invoiceData)) {
    return [];
  }
  
  return invoiceData
    .map((invoice) => {
      // Skip null or invalid invoices
      if (!invoice || typeof invoice !== 'object') {
        console.warn("Invoice is null or not an object");
        return null;
      }
      
      // Check if sales data is available
      if (!invoice.sales) {
        console.warn("Invoice has no sales data:", invoice);
        return null;
      }
      
      const sale = invoice.sales as {
        total_amount: number;
        shop_id: string;
        employee: { email: string } | null;
      };
      
      // Double check shop ID match
      if (!sale || sale.shop_id !== shopId) {
        console.warn("Shop ID mismatch:", {
          invoiceShopId: invoice.shop_id,
          saleShopId: sale?.shop_id,
          expectedShopId: shopId
        });
        return null;
      }
      
      return createInvoiceData(invoice, sale);
    })
    .filter((invoice): invoice is InvoiceData => invoice !== null);
};

// Function to generate invoice number
export const generateInvoiceNumber = async (shopId: string): Promise<string> => {
  try {
    console.log("Generating invoice number for shop:", shopId);
    
    // Get the current date
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    
    // Get the count of invoices for this shop today
    const startOfToday = startOfDay(today).toISOString();
    const endOfToday = endOfDay(today).toISOString();
    
    const { count, error } = await supabase
      .from('invoices')
      .select('id', { count: 'exact', head: true })
      .eq('shop_id', shopId)
      .gte('created_at', startOfToday)
      .lte('created_at', endOfToday);
    
    if (error) {
      console.error("Error counting invoices:", error);
      throw new Error("Impossible de générer un numéro de facture");
    }
    
    // Format: YYMMDD-SHOP-XXX where XXX is the sequential number for the day
    const sequentialNumber = ((count || 0) + 1).toString().padStart(3, '0');
    const shopPrefix = shopId.slice(0, 4).toUpperCase();
    
    const invoiceNumber = `${year}${month}${day}-${shopPrefix}-${sequentialNumber}`;
    console.log("Generated invoice number:", invoiceNumber);
    
    return invoiceNumber;
  } catch (error) {
    console.error("Error generating invoice number:", error);
    // Fallback to a timestamp-based number if there's an error
    const timestamp = Date.now().toString().slice(-6);
    return `INV-${timestamp}`;
  }
};
