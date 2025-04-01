
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { InvoiceModification } from "@/integrations/supabase/types/functions";

interface InvoiceViewDialogProps {
  open: boolean;
  onClose: () => void;
  invoice: any;
}

export const InvoiceViewDialog = ({ open, onClose, invoice }: InvoiceViewDialogProps) => {
  const [modifications, setModifications] = useState<InvoiceModification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && invoice?.id) {
      fetchModifications();
    }
  }, [open, invoice]);

  const fetchModifications = async () => {
    setIsLoading(true);
    try {
      // Use type assertion to tell TypeScript this is a valid RPC function
      const { data, error } = await (supabase.rpc(
        'get_invoice_modifications',
        { invoice_id_param: invoice.id }
      ) as any);

      if (error) throw error;
      
      // Cast data to the correct type after validating it's an array
      if (Array.isArray(data)) {
        setModifications(data as InvoiceModification[]);
      } else if (typeof data === 'object' && data !== null) {
        // Handle case where response might be a JSON object instead of array
        const modArray = Array.isArray(data) ? data : [];
        setModifications(modArray as InvoiceModification[]);
      } else {
        setModifications([]);
      }
    } catch (error) {
      console.error("Error fetching invoice modifications:", error);
      setModifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle the case where invoice might be null
  if (!invoice) return null;

  // Calculate display amount
  const displayAmount = invoice.is_modified && invoice.new_total_amount !== undefined
    ? invoice.new_total_amount
    : invoice.sales?.total_amount || 0;

  // Extract sale items for display
  const saleItems = invoice.sales?.sale_items || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Invoice {invoice.invoice_number}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Details */}
          <div className="border rounded-md p-4 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Invoice Information</h3>
              <span className="text-sm text-muted-foreground">
                {format(new Date(invoice.created_at), "PPP")}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-medium">{invoice.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{invoice.customer_phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Original Amount</p>
                <p className={`font-medium ${invoice.is_modified ? "line-through text-muted-foreground" : ""}`}>
                  {invoice.sales?.total_amount?.toLocaleString()} F CFA
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Amount</p>
                <p className="font-medium">{displayAmount.toLocaleString()} F CFA</p>
              </div>
            </div>
          </div>

          {/* Sale Items */}
          <div className="border rounded-md p-4 space-y-2">
            <h3 className="text-lg font-semibold">Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2">Item</th>
                    <th className="text-right py-2">Unit Price</th>
                    <th className="text-right py-2">Quantity</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {saleItems.map((item: any) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-2">{item.products?.name}</td>
                      <td className="text-right py-2">{item.price_at_sale?.toLocaleString()} F CFA</td>
                      <td className="text-right py-2">
                        {item.quantity}
                        {item.returned_quantity > 0 && (
                          <span className="text-red-500 ml-1">(-{item.returned_quantity})</span>
                        )}
                      </td>
                      <td className="text-right py-2">
                        {(item.price_at_sale * (item.quantity - (item.returned_quantity || 0)))?.toLocaleString()} F CFA
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="text-right py-2 font-semibold">Total:</td>
                    <td className="text-right py-2 font-semibold">{displayAmount.toLocaleString()} F CFA</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Modification History */}
          {invoice.is_modified && (
            <div className="border rounded-md p-4 space-y-2">
              <h3 className="text-lg font-semibold">Modification History</h3>
              {isLoading ? (
                <p className="text-center py-2 text-muted-foreground">Loading modifications...</p>
              ) : modifications.length > 0 ? (
                <div className="space-y-4">
                  {modifications.map((mod) => (
                    <div key={mod.id} className="border-b pb-2 last:border-0">
                      <div className="flex justify-between">
                        <span className="font-medium capitalize">{mod.modification_type} Modification</span>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(mod.created_at), "PPP p")}
                        </span>
                      </div>
                      <p className="text-sm mt-1">New Amount: {mod.new_amount?.toLocaleString()} F CFA</p>
                      <p className="text-sm mt-1">Reason: {mod.reason}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Modified by: {mod.profiles?.email || "Unknown"}
                      </p>
                      
                      {/* Display returned items if any */}
                      {mod.modification_type === "return" && mod.returned_items && mod.returned_items.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Returned Items:</p>
                          <ul className="text-sm ml-4 list-disc">
                            {mod.returned_items.map((item, index) => {
                              const returnedQty = item.originalQuantity - item.quantity;
                              return (
                                <li key={index}>
                                  {item.name}: {returnedQty} units returned
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-2 text-muted-foreground">No modification history found</p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
