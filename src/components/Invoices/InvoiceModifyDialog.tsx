import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useShopId } from "@/hooks/use-shop-id";

interface InvoiceModifyDialogProps {
  open: boolean;
  onClose: () => void;
  invoice: any;
  onModified: () => void;
}

export const InvoiceModifyDialog = ({ open, onClose, invoice, onModified }: InvoiceModifyDialogProps) => {
  const { toast } = useToast();
  const { shopId } = useShopId();
  const [newAmount, setNewAmount] = useState(invoice?.sales?.total_amount || 0);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      // Update the invoice
      const { error } = await supabase
        .from('invoices')
        .update({ 
          updated_at: new Date().toISOString(),
          shop_id: shopId // Ensure shop_id is maintained
        })
        .eq('id', invoice.id)
        .eq('shop_id', shopId); // Additional security check

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invoice has been modified",
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modify Invoice {invoice?.invoice_number}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">New Amount (F CFA)</Label>
            <Input
              id="amount"
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(Number(e.target.value))}
              required
            />
          </div>
          <div>
            <Label htmlFor="reason">Reason for Modification</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
