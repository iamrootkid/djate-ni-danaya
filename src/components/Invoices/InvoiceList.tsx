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
        () => {
          // Invalidate both invoices and dashboard data
          queryClient.invalidateQueries({ queryKey: ['invoices'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard_invoices'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          queryClient.invalidateQueries({ queryKey: ['products-stock'] });
          queryClient.invalidateQueries({ queryKey: ['inventory-report'] });
          queryClient.invalidateQueries({ queryKey: ['best-selling-products'] });
          queryClient.invalidateQueries({ queryKey: ['stock-summary'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invoice_modifications', filter: `shop_id=eq.${shopId}` },
        () => {
          // Invalidate both invoices and dashboard data
          queryClient.invalidateQueries({ queryKey: ['invoices'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard_invoices'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          queryClient.invalidateQueries({ queryKey: ['products-stock'] });
          queryClient.invalidateQueries({ queryKey: ['inventory-report'] });
          queryClient.invalidateQueries({ queryKey: ['best-selling-products'] });
          queryClient.invalidateQueries({ queryKey: ['stock-summary'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['products-stock'] });
          queryClient.invalidateQueries({ queryKey: ['inventory-report'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sale_items' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['invoices'] });
          queryClient.invalidateQueries({ queryKey: ['best-selling-products'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, shopId]);

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
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice Number</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Customer Phone</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Original Amount</TableHead>
                <TableHead>Current Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices && invoices.length > 0 ? (
                invoices.map((invoice) => {
                  const isModified = invoice.is_modified || 
                                    (new Date(invoice.updated_at).getTime() > 
                                    new Date(invoice.created_at).getTime() + 60000);
                  
                  const hasReturns = invoice.sales?.sale_items?.some(
                    item => item.returned_quantity && item.returned_quantity > 0
                  );
                  
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.invoice_number}</TableCell>
                      <TableCell>{invoice.customer_name}</TableCell>
                      <TableCell>
                        {invoice.customer_phone ? (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{invoice.customer_phone}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Numéro inconnu</span>
                        )}
                      </TableCell>
                      <TableCell>{format(new Date(invoice.created_at), "PPP")}</TableCell>
                      <TableCell className={isModified ? "line-through text-muted-foreground" : ""}>
                        {invoice.sales?.total_amount.toLocaleString()} F CFA
                      </TableCell>
                      <TableCell>
                        {isModified ? 
                          <span className="font-medium">
                            {(invoice.new_total_amount || invoice.sales?.total_amount).toLocaleString()} F CFA
                          </span> 
                          : 
                          invoice.sales?.total_amount.toLocaleString() + " F CFA"
                        }
                      </TableCell>
                      <TableCell>
                        {isModified && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                {hasReturns ? (
                                  <Badge variant="destructive" className="flex items-center gap-1">
                                    <RotateCcw className="h-3 w-3" />
                                    <span>Returns</span>
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">Modified</Badge>
                                )}
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">{invoice.modification_reason || "Modified invoice"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setSelectedInvoice(invoice)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setModifyingInvoice(invoice)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6">
                    Aucune facture trouvée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <InvoiceViewDialog
        open={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
      />

      {modifyingInvoice && (
        <InvoiceModifyDialog
          open={!!modifyingInvoice}
          onClose={() => setModifyingInvoice(null)}
          invoice={modifyingInvoice}
          onModified={() => {
            refetch();
            toast({
              title: "Invoice Modified",
              description: "The invoice has been successfully modified.",
            });
          }}
        />
      )}
    </>
  );
};
