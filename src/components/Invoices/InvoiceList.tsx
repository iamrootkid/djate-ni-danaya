import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import { Eye, Edit2, Phone, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { InvoiceViewDialog } from "./InvoiceViewDialog";
import { InvoiceModifyDialog } from "./InvoiceModifyDialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useShopId } from "@/hooks/use-shop-id";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface InvoiceListProps {
  dateFilter: "all" | "daily" | "monthly";
  startDate: Date | null;
  endDate: Date | null;
}

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_phone?: string;
  created_at: string;
  updated_at: string;
  shop_id: string;
  sale_id: string;
  is_modified?: boolean;
  modification_reason?: string;
  new_total_amount?: number;
  sales: {
    total_amount: number;
    shop_id: string;
    sale_items: Array<{
      id: string;
      quantity: number;
      returned_quantity?: number;
      price_at_sale: number;
      product_id: string;
      products: { name: string };
    }>;
  };
}

export const InvoiceList = ({ dateFilter, startDate, endDate }: InvoiceListProps) => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [modifyingInvoice, setModifyingInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();
  const { shopId } = useShopId();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!shopId) return;

    // Create a channel for both invoice and modification changes
    const channel = supabase
      .channel('invoice-and-modifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invoices', filter: `shop_id=eq.${shopId}` },
        (payload) => {
          console.log('Invoice change detected:', payload);
          // Invalidate both invoices and dashboard data
          queryClient.invalidateQueries({ queryKey: ['invoices'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard_invoices'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          queryClient.invalidateQueries({ queryKey: ['products-stock'] });
          queryClient.invalidateQueries({ queryKey: ['inventory-report'] });
          queryClient.invalidateQueries({ queryKey: ['best-selling-products'] });
          queryClient.invalidateQueries({ queryKey: ['stock-summary'] });
          
          // Show notification for modified invoices
          if (payload.eventType === 'UPDATE' && payload.new.is_modified && !payload.old.is_modified) {
            toast({
              title: "Invoice Modified",
              description: `Invoice #${payload.new.invoice_number} has been modified.`,
              duration: 5000,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invoice_modifications', filter: `shop_id=eq.${shopId}` },
        (payload) => {
          console.log('Invoice modification detected:', payload);
          // Invalidate both invoices and dashboard data
          queryClient.invalidateQueries({ queryKey: ['invoices'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard_invoices'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          queryClient.invalidateQueries({ queryKey: ['products-stock'] });
          queryClient.invalidateQueries({ queryKey: ['inventory-report'] });
          queryClient.invalidateQueries({ queryKey: ['best-selling-products'] });
          queryClient.invalidateQueries({ queryKey: ['stock-summary'] });
          queryClient.invalidateQueries({ queryKey: ['expenses'] });
          
          // Show notification for new modifications
          if (payload.eventType === 'INSERT') {
            toast({
              title: "Invoice Modification Recorded",
              description: "The invoice has been modified and all related data has been updated.",
              duration: 5000,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products', filter: `shop_id=eq.${shopId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['products-stock'] });
          queryClient.invalidateQueries({ queryKey: ['inventory-report'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sale_items', filter: `shop_id=eq.${shopId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['invoices'] });
          queryClient.invalidateQueries({ queryKey: ['best-selling-products'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, shopId, toast]);

  const { data: invoices, isLoading, refetch } = useQuery({
    queryKey: ["invoices", dateFilter, startDate, endDate, shopId],
    queryFn: async () => {
      if (!shopId) {
        console.error("No shop ID available for fetching invoices");
        return [];
      }

      // Verify the current user has access to this shop
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user found");
        return [];
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
        return [];
      }

      console.log("Fetching invoices for verified shop:", shopId);

      try {
        // Check if returned_quantity column exists
        const { data: columnExists, error: columnError } = await supabase.rpc(
          'check_column_exists',
          { table_name: 'sale_items', column_name: 'returned_quantity' }
        );

        if (columnError) {
          console.error("Error checking column:", columnError);
          // Continue but we'll handle missing column later
        }

        // Create base query
        let query = supabase
          .from("invoices")
          .select(`
            *,
            sales!inner (
              total_amount,
              shop_id,
              sale_items (
                id,
                quantity,
                ${columnExists ? 'returned_quantity,' : ''}
                price_at_sale,
                product_id,
                products (
                  name
                )
              )
            )
          `)
          .eq("shop_id", shopId)
          .eq("sales.shop_id", shopId)
          .order("created_at", { ascending: false });

        // Apply date filters
        if (dateFilter === "daily" && startDate) {
          query = query.gte("created_at", startOfDay(startDate).toISOString())
            .lte("created_at", endOfDay(startDate).toISOString());
        } else if (dateFilter === "monthly" && startDate) {
          query = query.gte("created_at", startOfMonth(startDate).toISOString())
            .lte("created_at", endOfMonth(startDate).toISOString());
        } else if (startDate && endDate) {
          query = query.gte("created_at", startOfDay(startDate).toISOString())
            .lte("created_at", endOfDay(endDate).toISOString());
        }

        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching invoices:", error);
          throw error;
        }

        if (!data || data.length === 0) {
          console.log("No invoices found for shop:", shopId);
          return [];
        }

        console.log("Raw invoice data for shop:", shopId, data);

        return data.map(invoice => {
          if (!invoice) return null;
          
          const sale = invoice.sales as {
            total_amount: number;
            shop_id: string;
            sale_items: Array<{
              id: string;
              quantity: number;
              returned_quantity?: number;
              price_at_sale: number;
              product_id: string;
              products: { name: string };
            }>;
          };

          // Double check shop ID match
          if (sale.shop_id !== shopId) {
            console.warn("Shop ID mismatch:", {
              invoiceShopId: invoice.shop_id,
              saleShopId: sale.shop_id,
              expectedShopId: shopId
            });
            return null;
          }

          // Return the invoice with properly typed properties
          return {
            ...invoice,
            sales: sale
          } as Invoice;
        }).filter(Boolean) as Invoice[];
      } catch (error) {
        console.error("Error processing invoices:", error);
        return [];
      }
    },
    enabled: !!shopId
  });

  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('is_admin');
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading invoices...
                  </TableCell>
                </TableRow>
              ) : invoices && invoices.length > 0 ? (
                invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.invoice_number}
                      {invoice.is_modified && (
                          <TooltipProvider>
                            <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-300">
                                Modified
                                  </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                              <p>This invoice was modified</p>
                              {invoice.modification_reason && (
                                <p className="text-xs mt-1">Reason: {invoice.modification_reason}</p>
                              )}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </TableCell>
                      <TableCell>
                      <div className="flex flex-col">
                        <span>{invoice.customer_name}</span>
                        {invoice.customer_phone && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Phone className="h-3 w-3 mr-1" />
                            {invoice.customer_phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.created_at), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className={invoice.is_modified ? "line-through text-gray-500" : ""}>
                          {invoice.sales?.total_amount.toLocaleString()} F CFA
                        </span>
                        {invoice.is_modified && invoice.new_total_amount !== undefined && (
                          <span className="font-medium text-green-600">
                            {invoice.new_total_amount.toLocaleString()} F CFA
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {invoice.is_modified ? (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                          Modified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                          Normal
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                          <Button
                          variant="ghost"
                            size="icon"
                            onClick={() => setSelectedInvoice(invoice)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <Button
                            variant="ghost"
                              size="icon"
                              onClick={() => setModifyingInvoice(invoice)}
                            >
                            <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No invoices found for the selected date range.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedInvoice && (
      <InvoiceViewDialog
        open={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
      />
      )}

      {modifyingInvoice && (
        <InvoiceModifyDialog
          open={!!modifyingInvoice}
          onClose={() => setModifyingInvoice(null)}
          invoice={modifyingInvoice}
          onModified={() => {
            refetch();
            setModifyingInvoice(null);
          }}
        />
      )}
    </div>
  );
};
