import { Dialog, DialogContent } from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Barcode, Phone, QrCode } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useShopId } from "@/hooks/use-shop-id";

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

  if (!invoice) return null;

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
              <span>N° {invoice.invoice_number}</span>
              <span>{format(new Date(invoice.created_at), "dd-MM-yyyy HH:mm")}</span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="text-xs space-y-1 border-b pb-2">
            <p>Client: {invoice.customer_name}</p>
            <p>Tel: {invoice.customer_phone}</p>
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
                  {(item.quantity * item.price_at_time).toLocaleString()} F
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
                {invoice.sales?.total_amount.toLocaleString()} F
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
              <p>{shopSettings?.receipt_footer || "Merci de votre confiance!"}</p>
              <p className="text-[10px]">
                {shopSettings?.return_policy || "Les articles vendus ne sont ni repris ni échangés"}
              </p>
              <p className="text-[10px]">Conservez votre ticket</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};