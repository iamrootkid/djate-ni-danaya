
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Barcode, Phone, QrCode, Mail, MapPin } from "lucide-react";
import { useShopSettings } from "@/hooks/use-shop-settings";
import { Skeleton } from "@/components/ui/skeleton";

interface InvoiceViewDialogProps {
  open: boolean;
  onClose: () => void;
  invoice: any;
}

export const InvoiceViewDialog = ({
  open,
  onClose,
  invoice,
}: InvoiceViewDialogProps) => {
  const { settings, isLoading } = useShopSettings();
  
  if (!invoice) return null;

  const LoadingHeader = () => (
    <div className="space-y-2">
      <Skeleton className="h-6 w-3/4 mx-auto" />
      <Skeleton className="h-4 w-1/2 mx-auto" />
      <Skeleton className="h-4 w-2/3 mx-auto" />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[80mm] mx-auto">
        <div className="p-2 space-y-3 font-mono text-sm print:p-0" id="invoice-content">
          {/* Header */}
          <div className="text-center space-y-1 border-b pb-2">
            {isLoading ? (
              <LoadingHeader />
            ) : (
              <>
                <h1 className="text-lg font-bold">{settings.storeName}</h1>
                {settings.storeAddress && (
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <MapPin className="h-3 w-3" />
                    <span>{settings.storeAddress}</span>
                  </div>
                )}
                {settings.storePhone && (
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <Phone className="h-3 w-3" />
                    <span>Tel: {settings.storePhone}</span>
                  </div>
                )}
                {settings.storeEmail && (
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <Mail className="h-3 w-3" />
                    <span>{settings.storeEmail}</span>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between text-xs pt-2">
              <span>N° {invoice.invoice_number}</span>
              <span>{format(new Date(invoice.created_at), "dd-MM-yyyy HH:mm")}</span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="text-xs space-y-1 border-b pb-2">
            <p>Client: {invoice.customer_name || "Client inconnu"}</p>
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <p>Tel: {invoice.customer_phone || "Numéro inconnu"}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <div className="grid grid-cols-12 text-xs font-bold">
              <div className="col-span-6">Article</div>
              <div className="col-span-2 text-center">Qté</div>
              <div className="col-span-4 text-right">Total</div>
            </div>
            <div className="border-t border-dashed"></div>
            {invoice.sales?.sale_items?.map((item: any, index: number) => (
              <div key={index} className="grid grid-cols-12 text-xs">
                <div className="col-span-6">{item.products?.name}</div>
                <div className="col-span-2 text-center">{item.quantity}</div>
                <div className="col-span-4 text-right">
                  {((item.quantity || 0) * (item.price_at_sale || 0)).toLocaleString()} {settings.currency}
                </div>
              </div>
            ))}
            <div className="border-t border-dashed"></div>
          </div>

          {/* Total */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between font-bold border-t pt-1">
              <span>Total:</span>
              <span>
                {(invoice.sales?.total_amount || 0).toLocaleString()} {settings.currency}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-2 text-xs pt-2 border-t">
            <p>Nombre d'articles: {invoice.sales?.sale_items?.length || 0}</p>
            <div className="flex justify-center space-x-4">
              <Barcode className="h-8 w-8" />
              <QrCode className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              {settings.receiptFooter ? (
                <p>{settings.receiptFooter}</p>
              ) : (
                <>
                  <p>Merci de votre confiance!</p>
                  <p className="text-[10px]">
                    Les articles vendus ne sont ni repris ni échangés
                  </p>
                  <p className="text-[10px]">Conservez votre ticket</p>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
