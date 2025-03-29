
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Download, RotateCcw } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface InvoiceViewDialogProps {
  open: boolean;
  onClose: () => void;
  invoice: any;
}

export const InvoiceViewDialog = ({ open, onClose, invoice }: InvoiceViewDialogProps) => {
  // Query to fetch modification history
  const { data: modifications } = useQuery({
    queryKey: ["invoice-modifications", invoice?.id],
    queryFn: async () => {
      if (!invoice?.id) return [];
      
      const { data, error } = await supabase
        .from("invoice_modifications")
        .select(`
          *,
          profiles (
            email
          )
        `)
        .eq("invoice_id", invoice.id)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!invoice?.id && open
  });

  const handlePrint = () => {
    window.print();
  };

  if (!invoice) return null;

  const createdDate = invoice.created_at 
    ? format(new Date(invoice.created_at), "PPP 'at' p")
    : "Unknown date";

  const isModified = invoice.is_modified || 
    (invoice.updated_at && new Date(invoice.updated_at).getTime() > new Date(invoice.created_at).getTime() + 60000);

  const displayAmount = isModified
    ? (invoice.new_total_amount || invoice.sales?.total_amount)
    : invoice.sales?.total_amount;

  // Check if any sale items have been returned
  const returnedItems = invoice.sales?.sale_items?.filter(
    (item: any) => item.returned_quantity && item.returned_quantity > 0
  ) || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Invoice {invoice.invoice_number}</span>
            {isModified && (
              <Badge variant="outline">Modified</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium">Customer Details</h3>
            <p>{invoice.customer_name}</p>
            {invoice.customer_phone && <p>{invoice.customer_phone}</p>}
          </div>
          <div className="text-right">
            <h3 className="text-sm font-medium">Invoice Date</h3>
            <p>{createdDate}</p>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-medium mb-2">Items</h3>
          <div className="border rounded-md">
            <div className="grid grid-cols-12 text-xs font-medium p-2 bg-muted">
              <div className="col-span-5">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-3 text-right">Total</div>
            </div>
            {invoice.sales?.sale_items?.map((item: any, index: number) => {
              const isReturned = item.returned_quantity && item.returned_quantity > 0;
              const currentQty = isReturned ? item.quantity - item.returned_quantity : item.quantity;
              
              return (
                <div 
                  key={index} 
                  className={`grid grid-cols-12 text-sm p-2 border-t ${isReturned ? "bg-muted/30" : ""}`}
                >
                  <div className="col-span-5 flex items-center">
                    {isReturned && <RotateCcw className="h-3 w-3 mr-1 text-destructive" />}
                    <span className={isReturned ? "text-muted-foreground" : ""}>
                      {item.products?.name}
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    {item.price_at_sale?.toLocaleString()} F
                  </div>
                  <div className="col-span-2 text-center">
                    {isReturned ? (
                      <span>
                        {currentQty} <span className="text-destructive text-xs">(-{item.returned_quantity})</span>
                      </span>
                    ) : (
                      item.quantity
                    )}
                  </div>
                  <div className="col-span-3 text-right">
                    {(currentQty * (item.price_at_sale || 0)).toLocaleString()} F
                  </div>
                </div>
              );
            })}
            <div className="grid grid-cols-12 text-sm font-medium p-2 border-t">
              <div className="col-span-9 text-right">Total:</div>
              <div className="col-span-3 text-right">
                {(displayAmount || 0).toLocaleString()} F CFA
              </div>
            </div>
          </div>
        </div>

        {isModified && modifications && modifications.length > 0 && (
          <>
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-2">Modification History</h3>
              <div className="border rounded-md max-h-40 overflow-y-auto">
                {modifications.map((mod: any, index: number) => (
                  <div key={index} className="p-2 text-sm border-b last:border-0">
                    <div className="flex justify-between">
                      <Badge variant={mod.modification_type === "return" ? "destructive" : "outline"}>
                        {mod.modification_type === "return" ? "Return" : 
                         mod.modification_type === "price" ? "Price Adjustment" : "Modification"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(mod.created_at), "MMM d, yyyy 'at' HH:mm")}
                      </span>
                    </div>
                    <div className="mt-1">
                      <p className="text-xs"><span className="font-medium">Reason:</span> {mod.reason}</p>
                      <p className="text-xs"><span className="font-medium">By:</span> {mod.profiles?.email || "Unknown"}</p>
                      {mod.modification_type === "price" && (
                        <p className="text-xs">
                          <span className="font-medium">Amount:</span> {mod.new_amount?.toLocaleString()} F CFA
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            variant="default" 
            onClick={handlePrint}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
