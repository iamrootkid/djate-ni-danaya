import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import { Eye, Edit2 } from "lucide-react";
import { useState, useEffect } from "react";
import { InvoiceViewDialog } from "./InvoiceViewDialog";
import { InvoiceModifyDialog } from "./InvoiceModifyDialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useShopId } from "@/hooks/use-shop-id";

interface InvoiceListProps {
  dateFilter: "all" | "daily" | "monthly";
  startDate: Date | null;
  endDate: Date | null;
}

export const InvoiceList = ({ dateFilter, startDate, endDate }: InvoiceListProps) => {
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [modifyingInvoice, setModifyingInvoice] = useState<any>(null);
  const { toast } = useToast();
  const { shopId } = useShopId();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!shopId) return;

    const channel = supabase
      .channel('invoice-list-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invoices', filter: `shop_id=eq.${shopId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['invoices'] });
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
      if (!shopId) return [];

      let query = supabase
        .from("invoices")
        .select(`
          *,
          sales (
            total_amount,
            sale_items (
              quantity,
              price_at_sale,
              product_id,
              products (
                name
              )
            )
          )
        `)
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false });

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
      if (error) throw error;
      return data;
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
                <TableHead>Date</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Modified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices?.map((invoice) => {
                // Check if the invoice has been modified by comparing created_at and updated_at timestamps
                const isModified = new Date(invoice.updated_at).getTime() > 
                                  new Date(invoice.created_at).getTime() + 60000; // Add 1 minute buffer
                
                return (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.customer_name}</TableCell>
                    <TableCell>{format(new Date(invoice.created_at), "PPP")}</TableCell>
                    <TableCell>{invoice.sales?.total_amount.toLocaleString()} F CFA</TableCell>
                    <TableCell>
                      {isModified && (
                        <Badge variant="outline">Modified</Badge>
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
              })}
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
