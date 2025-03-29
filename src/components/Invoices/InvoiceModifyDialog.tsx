
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useShopId } from "@/hooks/use-shop-id";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ReturnedItem } from "@/types/invoice";

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
      selected: z.boolean().default(false),
      price: z.number(),
    })
  ).optional(),
});

type ModificationFormValues = z.infer<typeof modificationSchema>;

interface InvoiceModifyDialogProps {
  open: boolean;
  onClose: () => void;
  invoice: any;
  onModified: () => void;
}

export const InvoiceModifyDialog = ({ open, onClose, invoice, onModified }: InvoiceModifyDialogProps) => {
  const { toast } = useToast();
  const { shopId } = useShopId();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalItems, setOriginalItems] = useState<ReturnedItem[]>([]);

  // Create form with default values
  const form = useForm<ModificationFormValues>({
    resolver: zodResolver(modificationSchema),
    defaultValues: {
      modType: "price",
      newAmount: invoice?.sales?.total_amount || 0,
      reason: "",
      returnedItems: [],
    },
  });

  const modType = form.watch("modType");

  // Define fetchSaleItems function
  const fetchSaleItems = async (saleId: string) => {
    try {
      const { data, error } = await supabase
        .from("sale_items")
        .select(`
          id,
          quantity,
          returned_quantity,
          price_at_sale,
          product_id,
          products (
            name
          )
        `)
        .eq("sale_id", saleId);

      if (error) throw error;

      // Handle possible column not found error
      if (data && Array.isArray(data)) {
        const formattedItems = data.map((item: any) => ({
          id: item.id || "",
          name: item.products?.name || "Unknown product",
          quantity: (item.quantity || 0) - (item.returned_quantity || 0),
          originalQuantity: (item.quantity || 0) - (item.returned_quantity || 0),
          price: item.price_at_sale || 0,
          selected: false,
        }));

        setOriginalItems(formattedItems);
        form.setValue("returnedItems", formattedItems);
      } else {
        console.error("Invalid data format:", data);
        toast({
          title: "Error",
          description: "Failed to load sale items: Invalid data format",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error fetching sale items:", error);
      toast({
        title: "Error",
        description: "Failed to load sale items",
        variant: "destructive",
      });
    }
  };

  // Fetch sale items when dialog opens
  useEffect(() => {
    if (open && invoice?.sale_id) {
      fetchSaleItems(invoice.sale_id);
    }
  }, [open, invoice]);

  const handleSubmit = async (values: ModificationFormValues) => {
    if (!shopId) {
      toast({
        title: "Error",
        description: "Shop ID not found. Please try again.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);

    try {
      // Verify the invoice belongs to the current shop
      const { data: invoiceData, error: verifyError } = await supabase
        .from('invoices')
        .select('shop_id')
        .eq('id', invoice.id)
        .single();

      if (verifyError) throw verifyError;
      if (invoiceData.shop_id !== shopId) {
        throw new Error("Unauthorized: Invoice does not belong to your shop");
      }

      // Create modification record
      const modificationData = {
        invoice_id: invoice.id,
        modification_type: values.modType,
        new_amount: values.newAmount,
        reason: values.reason,
        modified_by: (await supabase.auth.getUser()).data.user?.id,
        shop_id: shopId,
        created_at: new Date().toISOString(),
        returned_items: values.modType === "return" ? values.returnedItems?.filter(item => item.selected) : null
      };

      // Use RPC call to create the modification and update stock if necessary
      const { data: modificationResult, error: modificationError } = await supabase.rpc(
        'create_invoice_modification',
        modificationData
      );

      if (modificationError) {
        console.error("Error creating modification:", modificationError);
        throw modificationError;
      }

      // Update the invoice
      const { error } = await supabase
        .from('invoices')
        .update({ 
          updated_at: new Date().toISOString(),
          shop_id: shopId, // Ensure shop_id is maintained
          modification_reason: values.reason,
          is_modified: true,
          new_total_amount: values.newAmount
        })
        .eq('id', invoice.id)
        .eq('shop_id', shopId); // Additional security check

      if (error) throw error;

      // If this is a return, update the sale_items quantities
      if (values.modType === "return" && values.returnedItems) {
        const returnedItems = values.returnedItems.filter(item => item.selected && item.quantity < item.originalQuantity);
        
        for (const item of returnedItems) {
          const { error: updateError } = await supabase
            .from('sale_items')
            .update({ 
              returned_quantity: item.originalQuantity - item.quantity,
              updated_at: new Date().toISOString()
            })
            .eq('id', item.id);
            
          if (updateError) {
            console.error("Error updating returned item:", updateError);
            // Continue with other items even if one fails
          }
        }
      }

      toast({
        title: "Success",
        description: `Invoice has been ${values.modType === "return" ? "processed as a return" : "modified"}`,
      });
      
      onModified();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleItemSelection = (index: number, selected: boolean) => {
    const currentItems = form.getValues("returnedItems") || [];
    if (currentItems[index]) {
      currentItems[index].selected = selected;
      form.setValue("returnedItems", currentItems);
    }
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const currentItems = form.getValues("returnedItems") || [];
    if (currentItems[index]) {
      // Ensure quantity doesn't exceed original quantity
      const newQuantity = Math.min(quantity, currentItems[index].originalQuantity);
      currentItems[index].quantity = newQuantity;
      form.setValue("returnedItems", currentItems);
      
      // Recalculate total if in return mode
      if (modType === "return") {
        calculateNewTotal();
      }
    }
  };

  const calculateNewTotal = () => {
    const items = form.getValues("returnedItems") || [];
    const originalTotal = invoice?.sales?.total_amount || 0;
    
    // Calculate returned amount
    let returnedAmount = 0;
    items.forEach(item => {
      if (item.selected && item.quantity < item.originalQuantity) {
        const returnedQuantity = item.originalQuantity - item.quantity;
        returnedAmount += returnedQuantity * (item.price || 0);
      }
    });
    
    // Update new amount field
    form.setValue("newAmount", Math.max(0, originalTotal - returnedAmount));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Modify Invoice {invoice?.invoice_number}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                          Other Modification
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {modType === "return" && (
              <div className="space-y-4">
                <Label>Items to Return</Label>
                <div className="border rounded-md p-3 space-y-2 max-h-60 overflow-y-auto">
                  {originalItems.map((item, index) => (
                    <div key={item.id} className="flex items-center space-x-2 py-2 border-b last:border-0">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={e => handleItemSelection(index, e.target.checked)}
                        className="h-4 w-4"
                      />
                      <div className="flex-1">{item.name}</div>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`qty-${item.id}`}>Qty:</Label>
                        <Input
                          id={`qty-${item.id}`}
                          type="number"
                          disabled={!item.selected}
                          min={0}
                          max={item.originalQuantity}
                          value={item.quantity}
                          onChange={e => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                          className="w-16"
                        />
                        <span className="text-sm text-muted-foreground">/ {item.originalQuantity}</span>
                      </div>
                    </div>
                  ))}
                  {originalItems.length === 0 && (
                    <div className="text-center py-2 text-muted-foreground">No items found</div>
                  )}
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="newAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Amount (F CFA)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Modification</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please explain why this invoice is being modified"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
