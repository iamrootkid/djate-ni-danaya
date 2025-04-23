
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
import { safeGet, safeEq, createMatchFilter, isQueryError } from "@/utils/safeFilters";

interface InvoiceListProps {
  dateFilter: "all" | "daily" | "monthly";
  startDate: Date | null;
  endDate: Date | null;
}

interface SaleItem {
  id: string;
  quantity: number;
  returned_quantity?: number;
  price_at_sale: number;
  product_id: string;
  products: {
    name: string;
  };
}

interface Sale {
  total_amount: number;
  shop_id: string;
  sale_items: SaleItem[];
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
  sales: Sale;
}

export const InvoiceList = ({
  dateFilter,
  startDate,
  endDate
}: InvoiceListProps) => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [modifyingInvoice, setModifyingInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();
  const { shopId } = useShopId();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!shopId) return;

    const channel = supabase.channel('invoice-and-modifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'invoices',
        filter: `shop_id=eq.${shopId}`
      }, payload => {
        console.log('Invoice change detected:', payload);
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard_invoices'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['products-stock'] });
        queryClient.invalidateQueries({ queryKey: ['inventory-report'] });
        queryClient.invalidateQueries({ queryKey: ['best-selling-products'] });
        queryClient.invalidateQueries({ queryKey: ['stock-summary'] });

        if (payload.eventType === 'UPDATE' && payload.new.is_modified && !payload.old.is_modified) {
          toast({
            title: "Invoice Modified",
            description: `Invoice #${payload.new.invoice_number} has been modified.`,
            duration: 5000
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, shopId, toast]);

  const {
    data: invoices,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["invoices", dateFilter, startDate, endDate, shopId],
    queryFn: async () => {
      if (!shopId) {
        console.error("No shop ID available for fetching invoices");
        return [];
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error("No authenticated user found");
          return [];
        }
        
        // Use any type to avoid type conversion issues due to complex Supabase types
        const { data: userProfile, error: profileError } = await supabase
          .from("profiles")
          .select("shop_id")
          .eq("id", user.id as any)
          .single() as { data: any, error: any };
        
        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          return [];
        }
        
        const userShopId = userProfile?.shop_id;
        if (!userShopId || userShopId !== shopId) {
          console.error("User does not have access to this shop");
          return [];
        }
        
        console.log("Fetching invoices for verified shop:", shopId);
        
        const { data: columnExists, error: columnError } = await supabase.rpc('check_column_exists', {
          table_name: 'sale_items',
          column_name: 'returned_quantity'
        });
        
        if (columnError) {
          console.error("Error checking column:", columnError);
          // Continue but handle missing column
        }

        // Use any type for the supabase query to avoid TypeScript errors
        let query = supabase.from("invoices")
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
          .eq("shop_id", shopId as any) as any;

        if (dateFilter === "daily" && startDate) {
          query = query
            .gte("created_at", startOfDay(startDate).toISOString())
            .lte("created_at", endOfDay(startDate).toISOString());
        } else if (dateFilter === "monthly" && startDate) {
          query = query
            .gte("created_at", startOfMonth(startDate).toISOString())
            .lte("created_at", endOfMonth(startDate).toISOString());
        } else if (startDate && endDate) {
          query = query
            .gte("created_at", startOfDay(startDate).toISOString())
            .lte("created_at", endOfDay(endDate).toISOString());
        }
        
        query = query.order("created_at", { ascending: false });
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching invoices:", error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.log("No invoices found for shop:", shopId);
          return [];
        }
        
        // Filter out any potentially problematic records and cast them to the expected type
        return data
          .filter(invoice => invoice && invoice.sales && !isQueryError(invoice))
          .map(invoice => {
            // Perform safe access to all properties to avoid type errors
            return {
              id: invoice.id || '',
              invoice_number: invoice.invoice_number || '',
              customer_name: invoice.customer_name || '',
              customer_phone: invoice.customer_phone,
              created_at: invoice.created_at || '',
              updated_at: invoice.updated_at || '',
              shop_id: invoice.shop_id || '',
              sale_id: invoice.sale_id || '',
              is_modified: invoice.is_modified || false,
              modification_reason: invoice.modification_reason,
              new_total_amount: invoice.new_total_amount,
              sales: {
                total_amount: invoice.sales?.total_amount || 0,
                shop_id: invoice.sales?.shop_id || '',
                sale_items: Array.isArray(invoice.sales?.sale_items) ? invoice.sales.sale_items : []
              }
            };
          }) as Invoice[];
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
      try {
        const { data, error } = await supabase.rpc('is_admin');
        if (error) throw error;
        return !!data;
      } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
      }
    }
  });

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile", shopId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      // Use any type to avoid strict typing issues
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id as any)
        .single() as { data: any, error: any };
      
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
                <TableHead>Numero de facture</TableHead>
                <TableHead>Nom Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading invoices...
                  </TableCell>
                </TableRow> : invoices && invoices.length > 0 ? invoices.map(invoice => <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.invoice_number}
                      {invoice.is_modified && <TooltipProvider>
                            <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-300">
                                Modified
                                  </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                              <p>This invoice was modified</p>
                              {invoice.modification_reason && <p className="text-xs mt-1">Reason: {invoice.modification_reason}</p>}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>}
                      </TableCell>
                      <TableCell>
                      <div className="flex flex-col">
                        <span>{invoice.customer_name}</span>
                        {invoice.customer_phone && <div className="flex items-center text-xs text-gray-500">
                            <Phone className="h-3 w-3 mr-1" />
                            {invoice.customer_phone}
                          </div>}
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
                        {invoice.is_modified && invoice.new_total_amount !== undefined && <span className="font-medium text-green-600">
                            {invoice.new_total_amount.toLocaleString()} F CFA
                          </span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {invoice.is_modified ? <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                          Modified
                        </Badge> : <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                          Normal
                        </Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => setSelectedInvoice(invoice)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isAdmin && <Button variant="ghost" size="icon" onClick={() => setModifyingInvoice(invoice)}>
                            <RotateCcw className="h-4 w-4" />
                            </Button>}
                        </div>
                      </TableCell>
                    </TableRow>) : <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No invoices found for the selected date range.
                  </TableCell>
                </TableRow>}
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
