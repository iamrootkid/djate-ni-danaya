
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useShopId } from "./use-shop-id";
import { InvoiceData } from "@/types/invoice";
import { applyDateFilter } from "@/utils/date-filters";

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_phone?: string;
  created_at: string;
  total_amount: number;
  employee_email: string;
  is_modified: boolean;
  new_total_amount?: number;
  modification_reason?: string;
  sale_id: string;
  sales?: {
    total_amount: number;
    employee_id: string;
  };
}

export const useInvoiceList = ({ 
  dateFilter = "all", 
  startDate = null, 
  endDate = null 
}: {
  dateFilter: "all" | "daily" | "monthly";
  startDate: Date | null;
  endDate: Date | null;
}) => {
  const { shopId } = useShopId();
  const [isAdmin, setIsAdmin] = useState<boolean | undefined>(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [modifyingInvoice, setModifyingInvoice] = useState<Invoice | null>(null);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data, error } = await supabase.rpc('is_admin');
        if (error) throw error;
        setIsAdmin(data === true);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, []);

  // Fetch invoices
  const result = useQuery<InvoiceData[]>({
    queryKey: ["invoices", dateFilter, startDate, endDate, shopId],
    queryFn: async () => {
      if (!shopId) return [];

      let query = supabase
        .from("invoices")
        .select(`
          id,
          invoice_number,
          customer_name,
          customer_phone,
          created_at,
          is_modified,
          new_total_amount,
          sale_id,
          modification_reason,
          sales:sales(total_amount, employee_id)
        `)
        .eq("shop_id", shopId);

      if (dateFilter !== "all" && startDate) {
        query = applyDateFilter(query, dateFilter, startDate);
      }

      // Apply custom date range if specified
      if (startDate && endDate && dateFilter === "all") {
        query = query
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());
      }

      const { data: invoices, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;
      if (!invoices) return [];

      // Process invoices to fetch employee emails
      const processedInvoices = await Promise.all(
        invoices.map(async (invoice) => {
          // Get employee email if available
          let employeeEmail = "Email inconnu";
          if (invoice.sales && invoice.sales.employee_id) {
            const { data: employee } = await supabase
              .from("profiles")
              .select("email")
              .eq("id", invoice.sales.employee_id)
              .single();
            
            if (employee) {
              employeeEmail = employee.email;
            }
          }

          // Use modified amount if available
          const totalAmount = invoice.is_modified && invoice.new_total_amount !== null
            ? invoice.new_total_amount
            : invoice.sales?.total_amount || 0;

          return {
            id: invoice.id,
            invoice_number: invoice.invoice_number,
            customer_name: invoice.customer_name,
            customer_phone: invoice.customer_phone,
            created_at: invoice.created_at,
            total_amount: totalAmount,
            employee_email: employeeEmail,
            is_modified: invoice.is_modified || false,
            new_total_amount: invoice.new_total_amount,
            modification_reason: invoice.modification_reason,
            sale_id: invoice.sale_id,
            sales: invoice.sales
          };
        })
      );

      return processedInvoices;
    },
    enabled: !!shopId,
  });

  // Prepare invoice data for viewing
  const prepareInvoiceData = (invoice: Invoice) => {
    return {
      ...invoice,
      // Add any additional processing needed for invoice viewing
    };
  };

  return {
    ...result,
    invoices: result.data,
    isAdmin,
    selectedInvoice,
    setSelectedInvoice,
    modifyingInvoice,
    setModifyingInvoice,
    prepareInvoiceData,
  };
};
