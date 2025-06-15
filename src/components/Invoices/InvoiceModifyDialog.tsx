
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useShopId } from "@/hooks/use-shop-id";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ReturnedItem, Invoice } from "@/types/invoice";
import { Checkbox } from "@/components/ui/checkbox";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { asUUID, safeDataAccess, filterByUUID } from "@/utils/supabaseHelpers";
import { applyDateFilter } from "@/utils/date-filters";

const modificationSchema = z.object({
  modType: z.enum(["price", "return", "other"], {
    required_error: "Please select a modification type",
  }),
  newAmount: z.number().min(0, "Amount must be positive"),
  reason: z.string().min(3, "Reason must be at least 3 characters"),
  returnedItems: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      quantity: z.number().int().min(0),
      originalQuantity: z.number().int(),
      selected: z.boolean(),
      price: z.number(),
    })
  ).optional(),
});

type ModificationFormValues = z.infer<typeof modificationSchema>;

interface InvoiceModifyDialogProps {
  open: boolean;
  onClose: () => void;
  invoice: Invoice;
  onModified: () => void;
}

export const InvoiceModifyDialog = ({ open, onClose, invoice, onModified }: InvoiceModifyDialogProps) => {
  const { toast } = useToast();
  const { shopId } = useShopId();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalItems, setOriginalItems] = useState<ReturnedItem[]>([]);
  const queryClient = useQueryClient();
  const [currentAmount, setCurrentAmount] = useState(0);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [shopIdVerified, setShopIdVerified] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

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
    
    if (open) {
      checkAdminStatus();
    }
  }, [open]);

  useEffect(() => {
    const verifyShopId = async () => {
      if (!shopId || !invoice?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select('shop_id')
          .eq('id', invoice.id)
          .maybeSingle();
          
        if (error) throw error;
        
        const invoiceShopId = data?.shop_id;
        if (invoiceShopId !== shopId) {
          setVerificationError("Unauthorized: Invoice does not belong to your shop");
          setShopIdVerified(false);
        } else {
          setShopIdVerified(true);
          setVerificationError(null);
        }
      } catch (error) {
        console.error("Error verifying shop ID:", error);
        setVerificationError("Error verifying shop ownership");
        setShopIdVerified(false);
      }
    };
    
    if (open) {
      verifyShopId();
    }
  }, [open, shopId, invoice?.id]);

  // Function to fetch invoice items
  const fetchInvoiceItems = async (saleId: string) => {
    try {
      const { data, error } = await supabase
        .from("sale_items")
        .select(`
          id, 
          quantity, 
          price_at_sale, 
          returned_quantity,
          products (id, name, price)
        `)
        .eq("sale_id", saleId as any); // Use 'as any' to bypass type checking temporarily

      if (error) {
        console.error("Error fetching sale items:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in fetchInvoiceItems:", error);
      throw error;
    }
  };

  const form = useForm<ModificationFormValues>({
    resolver: zodResolver(modificationSchema),
    defaultValues: {
      modType: "price",
      newAmount: 0,
      reason: "",
      returnedItems: [],
    },
  });

  const modType = form.watch("modType");
  const returnedItems = form.watch("returnedItems") || [];

  useEffect(() => {
    if (open && invoice?.sale_id) {
      fetchInvoiceItems(invoice.sale_id)
        .then((items) => {
          const formattedItems = items.map((item: any) => ({
            id: item.id || "",
            name: item.products?.name || "Unknown product",
            quantity: (item.quantity || 0) - (item.returned_quantity || 0),
            originalQuantity: (item.quantity || 0) - (item.returned_quantity || 0),
            price: item.price_at_sale || 0,
            selected: false,
          }));

          setOriginalItems(formattedItems);
          form.setValue("returnedItems", formattedItems);
        })
        .catch((error) => {
          console.error("Error fetching sale items:", error);
          toast({ title: "Error", description: "Failed to load sale items" });
        });

      const actualAmount = invoice.is_modified && invoice.new_total_amount !== undefined 
        ? invoice.new_total_amount 
        : invoice.sales?.total_amount || 0;
      
      setCurrentAmount(actualAmount);
      form.setValue("newAmount", actualAmount);
    }
  }, [open, invoice]);

  useEffect(() => {
    if (modType === "return") {
      calculateNewTotal();
    }
  }, [returnedItems, modType]);

  const handleSubmit = async (values: ModificationFormValues) => {
    if (!shopId) {
      toast({
        title: "Error",
        description: "Shop ID not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (!isAdmin) {
      toast({
        title: "Permission Denied",
        description: "Only administrators can modify invoices.",
        variant: "destructive",
      });
      return;
    }

    if (!shopIdVerified) {
      toast({
        title: "Verification Failed",
        description: verificationError || "Unable to verify shop ownership.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const modificationData = {
        invoice_id: invoice.id,
        modification_type: values.modType,
        new_amount: values.newAmount,
        reason: values.reason,
        modified_by: (await supabase.auth.getUser()).data.user?.id || "",
        shop_id: shopId,
        created_at: new Date().toISOString(),
        returned_items: values.modType === "return" && values.returnedItems 
          ? values.returnedItems
              .filter(item => item.selected)
              .map(({ id, name, quantity, originalQuantity, price }) => ({
                id,
                name,
                quantity,
                originalQuantity,
                price,
                selected: true
              }))
          : null
      };

      const { data: modificationResult, error: modificationError } = await supabase.rpc(
        'create_invoice_modification',
        modificationData
      );

      if (modificationError) {
        console.error("Error creating modification:", modificationError);
        throw modificationError;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['invoices'] }),
        queryClient.invalidateQueries({ queryKey: ['invoice-modifications', invoice.id] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard_sales'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard_invoices'] }),
        queryClient.invalidateQueries({ queryKey: ['recent-orders'] }),
        queryClient.invalidateQueries({ queryKey: ['products-stock'] }),
        queryClient.invalidateQueries({ queryKey: ['inventory-report'] }),
        queryClient.invalidateQueries({ queryKey: ['stock-summary'] }),
        queryClient.invalidateQueries({ queryKey: ['best-selling-products'] }),
        queryClient.invalidateQueries({ queryKey: ['expenses'] }),
      ]);

      toast({
        title: "Success",
        description: `Invoice has been ${values.modType === "return" ? "processed as a return" : "modified"}. Stock and dashboard have been updated.`,
      });

      onModified();
      onClose();
    } catch (error: any) {
      console.error("Error modifying invoice:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to modify invoice",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleItemSelection = (index: number, selected: boolean) => {
    const currentItems = [...form.getValues("returnedItems") || []];
    if (currentItems[index]) {
      currentItems[index].selected = selected;
      form.setValue("returnedItems", currentItems);
    }
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const currentItems = [...form.getValues("returnedItems") || []];
    if (currentItems[index]) {
      currentItems[index].quantity = Math.min(
        Math.max(0, quantity),
        currentItems[index].originalQuantity
      );
      form.setValue("returnedItems", currentItems);
    }
  };

  const calculateNewTotal = () => {
    const items = form.getValues("returnedItems") || [];
    let newTotal = currentAmount;
    
    items.forEach(item => {
      if (item.selected) {
        const returnQuantity = item.originalQuantity - item.quantity;
        const itemReturnValue = returnQuantity * item.price;
        newTotal -= itemReturnValue;
      }
    });
    
    form.setValue("newAmount", Math.max(0, newTotal));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Modify Invoice
            {invoice?.is_modified && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                Previously Modified
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        {!isAdmin && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Permission Denied</AlertTitle>
            <AlertDescription>
              Only administrators can modify invoices. Please contact your system administrator.
            </AlertDescription>
          </Alert>
        )}
        
        {verificationError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Verification Failed</AlertTitle>
            <AlertDescription>
              {verificationError}
            </AlertDescription>
          </Alert>
        )}
        
        {invoice?.is_modified && (
          <Alert className="mb-4 bg-yellow-50 border-yellow-200">
            <Info className="h-4 w-4 text-yellow-600" />
            <AlertTitle>Previously Modified Invoice</AlertTitle>
            <AlertDescription>
              This invoice was previously modified. The current amount is {invoice.new_total_amount?.toLocaleString()} F CFA.
              {invoice.modification_reason && (
                <div className="mt-1">
                  <strong>Previous reason:</strong> {invoice.modification_reason}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Invoice Number</Label>
                <Input value={invoice?.invoice_number || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label>Customer</Label>
                <Input value={invoice?.customer_name || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label>Original Amount</Label>
                <Input value={invoice?.sales?.total_amount || 0} disabled />
              </div>
              <div className="space-y-2">
                <Label>Current Amount</Label>
                <Input value={currentAmount.toLocaleString()} disabled />
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="modType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Modification Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="price" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Price Adjustment
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="return" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Return Items
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="other" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Other
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {modType === "return" && (
              <div className="space-y-4 border rounded-md p-4">
                <h3 className="font-medium">Return Items</h3>
                <div className="space-y-2">
                  {returnedItems.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-4 p-2 border rounded-md">
                        <Checkbox
                        checked={item.selected}
                        onCheckedChange={(checked) => 
                          handleItemSelection(index, checked === true)
                        }
                      />
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          Original: {item.originalQuantity} | Price: ${item.price}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`quantity-${index}`}>Return:</Label>
                          <Input
                          id={`quantity-${index}`}
                            type="number"
                            min={0}
                            max={item.originalQuantity}
                          value={item.quantity}
                          onChange={(e) => 
                            handleQuantityChange(index, parseInt(e.target.value) || 0)
                          }
                          className="w-20"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="newAmount">New Amount</Label>
                    <Input
                id="newAmount"
                      type="number"
                {...form.register("newAmount", { valueAsNumber: true })}
                disabled={modType === "return"}
              />
                  <FormMessage />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Modification</Label>
                    <Textarea
                id="reason"
                {...form.register("reason")}
                placeholder="Please provide a reason for this modification"
                    />
                  <FormMessage />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !isAdmin || !shopIdVerified}
              >
                {isSubmitting ? "Processing..." : "Submit Modification"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
