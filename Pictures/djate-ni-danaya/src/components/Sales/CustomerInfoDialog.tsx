
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { InvoicePreviewDialog } from "./InvoicePreviewDialog";
import { CartItem } from "@/types/sales";
import { useToast } from "@/hooks/use-toast";
import { CheckoutResult } from "@/hooks/use-checkout";

interface CustomerInfoDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (customerName: string, customerPhone: string) => Promise<CheckoutResult>;
  isPending: boolean;
  cart: CartItem[];
  cartTotal: number;
}

export const CustomerInfoDialog = ({
  open,
  onClose,
  onSubmit,
  isPending,
  cart,
  cartTotal,
}: CustomerInfoDialogProps) => {
  const { toast } = useToast();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      if (!customerName.trim()) {
        throw new Error("Le nom du client est requis");
      }

      if (!customerPhone.trim()) {
        throw new Error("Le numéro de téléphone est requis");
      }

      // Call the onSubmit function passed as prop
      const result = await onSubmit(customerName, customerPhone);
      
      if (!result || !result.invoiceNumber) {
        throw new Error("Aucun numéro de facture reçu");
      }

      setInvoiceData({
        invoiceNumber: result.invoiceNumber,
        customerName,
        customerPhone,
        items: cart,
        total: cartTotal,
        date: new Date(),
      });
      setShowInvoice(true);
    } catch (error: any) {
      console.error("Error during invoice generation:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la génération de la facture. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCustomerName("");
    setCustomerPhone("");
    setShowInvoice(false);
    setInvoiceData(null);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <>
      <Dialog open={open && !showInvoice} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Informations client</DialogTitle>
            <DialogDescription>
              Veuillez saisir les informations du client pour générer la facture.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Nom du client</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Numéro de téléphone</Label>
              <Input
                id="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Annuler
              </Button>
              <Button type="submit" disabled={isPending || isSubmitting}>
                {isPending || isSubmitting ? "Traitement..." : "Générer la facture"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {showInvoice && invoiceData && (
        <InvoicePreviewDialog
          open={showInvoice}
          onClose={handleClose}
          invoiceData={invoiceData}
        />
      )}
    </>
  );
};
