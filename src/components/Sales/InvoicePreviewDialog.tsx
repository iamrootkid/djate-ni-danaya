import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Barcode, Phone, QrCode } from "lucide-react";

interface InvoicePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  invoiceData: {
    invoiceNumber: string;
    customerName: string;
    customerPhone: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    total: number;
    date: Date;
  };
}

export const InvoicePreviewDialog = ({
  open,
  onClose,
  invoiceData,
}: InvoicePreviewDialogProps) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[80mm] mx-auto">
        <div className="p-2 space-y-3 font-mono text-sm print:p-0" id="invoice-content">
          {/* Header */}
          <div className="text-center space-y-1 border-b pb-2">
            <h1 className="text-lg font-bold">DATE NI DANAYA</h1>
            <p className="text-xs">ALL TYPE OF THINGS</p>
            <p className="text-xs">BKO</p>
            <div className="flex items-center justify-center gap-1 text-xs">
              <Phone className="h-3 w-3" />
              <span>Tel: +223 XX XX XX XX</span>
            </div>
            <div className="flex justify-between text-xs pt-2">
              <span>N° {invoiceData.invoiceNumber}</span>
              <span>{format(invoiceData.date, "dd-MM-yyyy HH:mm")}</span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="text-xs space-y-1 border-b pb-2">
            <p>Client: {invoiceData.customerName}</p>
            <p>Tel: {invoiceData.customerPhone}</p>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <div className="grid grid-cols-12 text-xs font-bold">
              <div className="col-span-6">Article</div>
              <div className="col-span-2 text-center">Qté</div>
              <div className="col-span-4 text-right">Total</div>
            </div>
            <div className="border-t border-dashed"></div>
            {invoiceData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 text-xs">
                <div className="col-span-6">{item.name}</div>
                <div className="col-span-2 text-center">{item.quantity}</div>
                <div className="col-span-4 text-right">
                  {(item.quantity * item.price).toLocaleString()} F
                </div>
              </div>
            ))}
            <div className="border-t border-dashed"></div>
          </div>

          {/* Total */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between font-bold border-t pt-1">
              <span>Total:</span>
              <span>{invoiceData.total.toLocaleString()} F</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-2 text-xs pt-2 border-t">
            <p>Nombre d'articles: {invoiceData.items.length}</p>
            <div className="flex justify-center space-x-4">
              <Barcode className="h-8 w-8" />
              <QrCode className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p>Merci de votre confiance!</p>
              <p className="text-[10px]">
                Les articles vendus ne sont ni repris ni échangés
              </p>
              <p className="text-[10px]">Conservez votre ticket</p>
            </div>
          </div>
        </div>

        {/* Print Button */}
        <div className="flex justify-end space-x-2 print:hidden">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90">
            Imprimer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};