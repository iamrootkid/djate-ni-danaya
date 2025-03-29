
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { InvoiceModification } from "@/integrations/supabase/types/functions";

interface InvoiceViewDialogProps {
  open: boolean;
  onClose: () => void;
  invoice: any;
}

export const InvoiceViewDialog = ({ open, onClose, invoice }: InvoiceViewDialogProps) => {
  const [activeTab, setActiveTab] = useState<"details" | "modifications">("details");

  // Fetch invoice modifications
  const { data: modifications, isLoading } = useQuery<InvoiceModification[]>({
    queryKey: ["invoice-modifications", invoice?.id],
    queryFn: async () => {
      if (!invoice?.id) return [];

      const { data, error } = await supabase.rpc(
        'get_invoice_modifications',
        { invoice_id: invoice.id }
      );

      if (error) {
        console.error("Error fetching modifications:", error);
        return [];
      }

      return (data as InvoiceModification[]) || [];
    },
    enabled: !!invoice?.id && open
  });

  // Function to format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP p");
    } catch (error) {
      return dateString;
    }
  };

  // Get modification type badge
  const getModificationBadge = (type: string) => {
    switch (type) {
      case "price":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Price Adjustment</Badge>;
      case "return":
        return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Return</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50">Other</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Invoice {invoice?.invoice_number}</DialogTitle>
          <div className="flex space-x-4 text-sm border-b pb-2 mt-2">
            <button
              className={`pb-2 px-1 ${activeTab === "details" ? "border-b-2 border-primary font-medium" : "text-muted-foreground"}`}
              onClick={() => setActiveTab("details")}
            >
              Details
            </button>
            <button
              className={`pb-2 px-1 flex items-center space-x-1 ${activeTab === "modifications" ? "border-b-2 border-primary font-medium" : "text-muted-foreground"}`}
              onClick={() => setActiveTab("modifications")}
            >
              <span>Modifications</span>
              {modifications && modifications.length > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                  {modifications.length}
                </span>
              )}
            </button>
          </div>
        </DialogHeader>

        {activeTab === "details" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Customer</h3>
                <p className="mt-1">{invoice?.customer_name || "N/A"}</p>
                {invoice?.customer_phone && (
                  <p className="text-sm text-muted-foreground">{invoice.customer_phone}</p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
                <p className="mt-1">{formatDate(invoice?.created_at)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Total Amount</h3>
                <p className="mt-1 font-semibold">{invoice?.sales?.total_amount?.toLocaleString()} F CFA</p>
                {invoice?.is_modified && invoice?.new_total_amount && (
                  <p className="text-sm text-muted-foreground">
                    Modified: {invoice.new_total_amount.toLocaleString()} F CFA
                  </p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Employee</h3>
                <p className="mt-1">{invoice?.sales?.employee?.email || "N/A"}</p>
              </div>
            </div>
            
            {invoice?.is_modified && (
              <div className="mt-4 p-3 bg-amber-50 rounded-md border border-amber-100">
                <h3 className="text-sm font-medium text-amber-800">This invoice has been modified</h3>
                <p className="mt-1 text-sm text-amber-700">{invoice?.modification_reason}</p>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
          </div>
        )}
        
        {activeTab === "modifications" && (
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-center py-4 text-muted-foreground">Loading modifications...</p>
            ) : !modifications || modifications.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No modifications found for this invoice</p>
            ) : (
              <div className="space-y-4">
                {modifications.map((mod) => (
                  <div key={mod.id} className="border rounded-md p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        {getModificationBadge(mod.modification_type)}
                        <p className="mt-2 text-sm">{mod.reason}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{formatDate(mod.created_at)}</p>
                        <p className="text-sm">{mod.profiles?.email || "Unknown"}</p>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium">New amount: {mod.new_amount.toLocaleString()} F CFA</p>
                      
                      {mod.modification_type === "return" && mod.returned_items && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Returned items:</p>
                          <ul className="mt-1 text-sm space-y-1">
                            {Array.isArray(mod.returned_items) && mod.returned_items.map((item: any, idx: number) => (
                              <li key={idx} className="flex justify-between">
                                <span>{item.name}</span>
                                <span>{item.originalQuantity - item.quantity} units</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-end">
              <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
