import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Check, FileCheck, FileX, Printer, RefreshCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { InvoiceData, InvoiceModification } from "@/types/invoice";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { asUUID } from "@/utils/supabaseHelpers";
import { useIsMobile } from "@/hooks/use-mobile";

interface SaleItem {
  id: string;
  quantity: number;
  price_at_sale: number;
  returned_quantity?: number;
  products?: {
    name: string;
  } | null;
}

interface InvoiceViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceData;
  onReturnItems?: () => void;
  onModifyPrice?: () => void;
  refreshInvoices: () => void;
}

interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  returned_quantity?: number;
}

export function InvoiceViewDialog({
  open,
  onOpenChange,
  invoice,
  onReturnItems,
  onModifyPrice,
  refreshInvoices,
}: InvoiceViewDialogProps) {
  const [showModifications, setShowModifications] = useState(false);
  const isMobile = useIsMobile();

  const { data: items = [] } = useQuery<InvoiceItem[]>({
    queryKey: ["invoice-items", invoice?.id],
    queryFn: async () => {
      if (!invoice?.id) return [];

      const validInvoiceId = asUUID(invoice.id);
      if (!validInvoiceId) {
        console.error("Invalid invoice ID for fetching items:", invoice.id);
        return [];
      }

      try {
        // Get the sale ID first
        const { data: invoiceData, error: invoiceError } = await supabase
          .from("invoices")
          .select("sale_id")
          .eq("id", validInvoiceId as any)
          .maybeSingle();
        
        if (invoiceError) throw invoiceError;
        if (!invoiceData || !invoiceData.sale_id) return [];
        
        const saleId = invoiceData.sale_id;
        
        // Then get the sale items using the sale_id
        const { data, error } = await supabase
          .from("sale_items")
          .select(`
            id,
            quantity,
            price_at_sale,
            returned_quantity,
            products (
              name
            )
          `)
          .eq("sale_id", saleId);

        if (error) throw error;
        
        const saleItems = (data || []) as any;
        
        // Transform the raw data into the expected format with proper type checking
        const validItems: InvoiceItem[] = saleItems.map((item: any) => ({
            id: item.id || "",
            name: item.products?.name || "Unknown Product",
            quantity: item.quantity || 0,
            price: item.price_at_sale || 0,
            returned_quantity: item.returned_quantity || undefined
        }));
        
        return validItems;
      } catch (error) {
        console.error("Error fetching invoice items:", error);
        return [];
      }
    },
    enabled: !!invoice?.id && open,
  });

  const { data: modifications = [] } = useQuery({
    queryKey: ["invoice-modifications", invoice?.id],
    queryFn: async () => {
      if (!invoice?.id) return [];

      try {
        const { data, error } = await supabase.rpc(
          "get_invoice_modifications",
          { invoice_id_param: invoice.id }
        );

        if (error) throw error;
        return (data || []) as InvoiceModification[];
      } catch (error) {
        console.error("Error fetching invoice modifications:", error);
        return [];
      }
    },
    enabled: !!invoice?.id && open && showModifications,
  });

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isMobile ? "max-w-full p-2 bg-white dark:bg-gray-950" : "max-w-3xl max-h-screen overflow-y-auto p-6 bg-white dark:bg-gray-950"}>
        <DialogHeader>
          <DialogTitle className={isMobile ? "text-lg font-bold flex justify-between items-center" : "text-xl font-bold flex justify-between items-center"}>
            <span>Facture #{invoice.invoice_number}</span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowModifications(!showModifications)}
                className="h-8 w-8"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrint}
                className="h-8 w-8"
              >
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {isMobile ? (
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#18181b] rounded-xl p-4 border border-border shadow-sm">
              <div className="flex flex-col gap-2 mb-2">
                <div className="text-sm text-muted-foreground">Client</div>
                <div className="font-bold text-foreground text-lg">{invoice.customer_name}</div>
                {invoice.customer_phone && (
                  <div className="text-sm text-muted-foreground">{invoice.customer_phone}</div>
                )}
              </div>
              <div className="flex flex-col gap-2 mb-2">
                <div className="text-sm text-muted-foreground">Date</div>
                <div className="text-foreground">{formatDate(invoice.created_at)}</div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-sm text-muted-foreground">Employé</div>
                <div className="text-foreground">{invoice.employee_email}</div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#18181b] rounded-xl p-4 border border-border shadow-sm">
              <div className="font-semibold mb-2 text-foreground">Articles</div>
              <div className="space-y-2">
                {items.length === 0 ? (
                  <div className="text-muted-foreground text-sm">Aucun article</div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center border-b border-border/50 py-2 last:border-b-0">
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.quantity} x {item.price.toLocaleString()} F CFA</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-foreground">{(item.quantity * item.price).toLocaleString()} F CFA</div>
                        {item.returned_quantity ? (
                          <div className="text-xs text-yellow-600">Retourné: {item.returned_quantity}</div>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="bg-white dark:bg-[#18181b] rounded-xl p-4 border border-border shadow-sm flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-bold text-lg text-[#22c55e]">{(invoice.total_amount || 0).toLocaleString()} F CFA</span>
              </div>
              {invoice.is_modified && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-yellow-600">Modifiée</span>
                  <span className="font-bold text-yellow-600">{invoice.new_total_amount?.toLocaleString()} F CFA</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="invoice-content">
            <div className="flex justify-between mb-6">
              <div>
                <h3 className="font-semibold text-muted-foreground">Client</h3>
                <p className="text-lg font-medium">{invoice.customer_name}</p>
                {invoice.customer_phone && (
                  <p className="text-sm text-muted-foreground">
                    {invoice.customer_phone}
                  </p>
                )}
              </div>
              <div className="text-right">
                <h3 className="font-semibold text-muted-foreground">Date</h3>
                <p>{formatDate(invoice.created_at)}</p>
                <h3 className="font-semibold text-muted-foreground mt-2">
                  Employee
                </h3>
                <p>{invoice.employee_email}</p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div className="rounded-lg border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">Item</th>
                      <th className="p-2 text-right">Quantity</th>
                      <th className="p-2 text-right">Unit Price</th>
                      <th className="p-2 text-right">Total</th>
                      <th className="p-2 text-right">Returned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="p-2">{item.name}</td>
                        <td className="p-2 text-right">{item.quantity}</td>
                        <td className="p-2 text-right">${item.price.toFixed(2)}</td>
                        <td className="p-2 text-right">
                          ${(item.quantity * item.price).toFixed(2)}
                        </td>
                        <td className="p-2 text-right">
                          {item.returned_quantity ? (
                            <Badge variant="outline" className="bg-red-50 dark:bg-red-950">
                              {item.returned_quantity}
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-medium">
                      <td className="p-2" colSpan={3}>
                        Total
                      </td>
                      <td className="p-2 text-right">
                        ${invoice.total_amount.toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {showModifications && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Invoice Modifications</h3>
                  {modifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No modifications found</p>
                  ) : (
                    <div className="space-y-3">
                      {modifications.map((mod) => (
                        <Card key={mod.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">
                                  {mod.modification_type.charAt(0).toUpperCase() +
                                    mod.modification_type.slice(1)}
                                  {mod.modification_type === "return" && (
                                    <Badge className="ml-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                      Items Returned
                                    </Badge>
                                  )}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(mod.created_at)}
                                </p>
                                <p className="mt-2">{mod.reason}</p>
                                {mod.new_amount !== null && (
                                  <p className="mt-1">
                                    New amount: ${mod.new_amount.toFixed(2)}
                                  </p>
                                )}
                                {mod.returned_items && mod.returned_items.length > 0 && (
                                  <div className="mt-3">
                                    <p className="text-sm font-medium">Returned items:</p>
                                    <ul className="text-sm list-disc pl-5">
                                      {mod.returned_items.map((item) => (
                                        <li key={item.id}>
                                          {item.name} - {item.quantity} of{" "}
                                          {item.originalQuantity}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                              <div className="shrink-0">
                                {mod.modification_type === "return" ? (
                                  <FileX className="h-5 w-5 text-red-500" />
                                ) : (
                                  <FileCheck className="h-5 w-5 text-blue-500" />
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                {onReturnItems && (
                  <Button onClick={onReturnItems} variant="outline">
                    Return Items
                  </Button>
                )}
                {onModifyPrice && (
                  <Button onClick={onModifyPrice} variant="outline">
                    Modify Price
                  </Button>
                )}
                <Button onClick={() => onOpenChange(false)}>
                  <Check className="mr-2 h-4 w-4" /> Done
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
  
  function handlePrint() {
    window.print();
  }
  
  function formatDate(dateString: string) {
    try {
      return format(new Date(dateString), "PPpp");
    } catch (e) {
      return dateString;
    }
  }
}
