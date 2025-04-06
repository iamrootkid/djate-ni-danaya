import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { InvoiceModification } from "@/types/invoice";
import { useInvoiceModifications } from "@/hooks/use-invoice-modifications";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, Info, RotateCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface InvoiceViewDialogProps {
  open: boolean;
  onClose: () => void;
  invoice: any;
}

export const InvoiceViewDialog = ({ open, onClose, invoice }: InvoiceViewDialogProps) => {
  const { modifications, isLoading } = useInvoiceModifications(invoice?.id);
  const modificationsArray = Array.isArray(modifications) ? modifications : [];

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
          <DialogTitle className="flex items-center gap-2">
            Invoice {invoice.invoice_number}
            {invoice.is_modified && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                Modified
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {invoice.is_modified && (
          <Alert className="mb-4 bg-yellow-50 border-yellow-200">
            <Info className="h-4 w-4 text-yellow-600" />
            <AlertTitle>Modified Invoice</AlertTitle>
            <AlertDescription>
              This invoice was previously modified. The current amount is {invoice.new_total_amount?.toLocaleString()} F CFA.
              {invoice.modification_reason && (
                <div className="mt-1">
                  <strong>Reason:</strong> {invoice.modification_reason}
            </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="items">Items</TabsTrigger>
            {invoice.is_modified && (
              <TabsTrigger value="history">Modification History</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Information</CardTitle>
                <CardDescription>
                  Created on {format(new Date(invoice.created_at), "PPP")}
                </CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="items" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Items</CardTitle>
                <CardDescription>
                  {saleItems.length} items in this invoice
                </CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </TabsContent>

          {invoice.is_modified && (
            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Modification History</CardTitle>
                  <CardDescription>
                    Record of all modifications made to this invoice
                  </CardDescription>
                </CardHeader>
                <CardContent>
              {isLoading ? (
                    <p className="text-center py-4 text-muted-foreground">Loading modifications...</p>
                  ) : modificationsArray.length > 0 ? (
                    <div className="space-y-6">
                      {modificationsArray.map((mod) => (
                        <div key={mod.id} className="border rounded-md p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              {mod.modification_type === "return" ? (
                                <RotateCcw className="h-5 w-5 text-blue-500" />
                              ) : (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              )}
                        <span className="font-medium capitalize">{mod.modification_type} Modification</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {format(new Date(mod.created_at), "MMM d, yyyy HH:mm")}
                            </Badge>
                          </div>
                          
                          <div className="mt-3 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">New Amount</p>
                              <p className="font-medium">{mod.new_amount?.toLocaleString()} F CFA</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Modified By</p>
                              <p className="font-medium">{mod.profiles?.email || "Unknown"}</p>
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <p className="text-sm text-muted-foreground">Reason</p>
                            <p className="mt-1">{mod.reason}</p>
                      </div>
                      
                      {/* Display returned items if any */}
                      {mod.modification_type === "return" && mod.returned_items && mod.returned_items.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-medium mb-2">Returned Items:</p>
                              <div className="border rounded-md overflow-hidden">
                                <table className="w-full text-sm">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="text-left py-2 px-3">Item</th>
                                      <th className="text-right py-2 px-3">Original Qty</th>
                                      <th className="text-right py-2 px-3">Returned Qty</th>
                                      <th className="text-right py-2 px-3">Value</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                            {mod.returned_items.map((item, index) => {
                              const returnedQty = item.originalQuantity - item.quantity;
                                      const returnValue = returnedQty * item.price;
                              return (
                                        <tr key={index} className="border-t">
                                          <td className="py-2 px-3">{item.name}</td>
                                          <td className="text-right py-2 px-3">{item.originalQuantity}</td>
                                          <td className="text-right py-2 px-3">{returnedQty}</td>
                                          <td className="text-right py-2 px-3">{returnValue.toLocaleString()} F CFA</td>
                                        </tr>
                              );
                            })}
                                  </tbody>
                                </table>
                              </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                    <p className="text-center py-4 text-muted-foreground">No modification history found</p>
              )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
