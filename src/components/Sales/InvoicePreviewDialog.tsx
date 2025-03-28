import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Barcode, Phone, QrCode } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useShopId } from "@/hooks/use-shop-id";

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
  const { shopId } = useShopId();

  // Fetch shop settings
  const { data: shopSettings } = useQuery({
    queryKey: ["shop-settings", shopId],
    queryFn: async () => {
      if (!shopId) return null;
      
      const { data, error } = await supabase
        .from("settings")
        .select("key, value")
        .eq("shop_id", shopId);
        
      if (error) throw error;
      
      // Convert array to object for easier access
      return data.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);
    },
    enabled: !!shopId
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[80mm] mx-auto">
        <div className="p-2 space-y-3 font-mono text-sm print:p-0" id="invoice-content">
          {/* Header */}
          <div className="text-center space-y-1 border-b pb-2">
            <h1 className="text-lg font-bold">{shopSettings?.store_name || "DATE NI DANAYA"}</h1>
            <p className="text-xs">{shopSettings?.store_description || "ALL TYPE OF THINGS"}</p>
            <p className="text-xs">{shopSettings?.store_address || "BKO"}</p>
            <div className="flex items-center justify-center gap-1 text-xs">
              <Phone className="h-3 w-3" />
              <span>Tel: {shopSettings?.store_phone || "+223 XX XX XX XX"}</span>
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
              <p>{shopSettings?.receipt_footer || "Merci de votre confiance!"}</p>
              <p className="text-[10px]">
                {shopSettings?.return_policy || "Les articles vendus ne sont ni repris ni échangés"}
              </p>
              <p className="text-[10px]">Conservez votre ticket</p>
            </div>
          </div>
        </div>

        {/* Print Button */}
        <div className="flex justify-end mt-4 print:hidden">
          <Button onClick={handlePrint}>Print Receipt</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};