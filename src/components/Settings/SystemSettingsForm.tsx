import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useShopId } from "@/hooks/use-shop-id";
import { CopyIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SystemSettingsFormProps {
  invoicePrefix: string;
  setInvoicePrefix: (value: string) => void;
  receiptFooter: string;
  setReceiptFooter: (value: string) => void;
  emailNotifications: boolean;
  setEmailNotifications: (value: boolean) => void;
  autoBackup: boolean;
  setAutoBackup: (value: boolean) => void;
}

export const SystemSettingsForm = ({
  invoicePrefix,
  setInvoicePrefix,
  receiptFooter,
  setReceiptFooter,
  emailNotifications,
  setEmailNotifications,
  autoBackup,
  setAutoBackup,
}: SystemSettingsFormProps) => {
  const { shopId } = useShopId();
  const [copied, setCopied] = useState(false);
  const [shopPin, setShopPin] = useState<string>("");
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    // Charger le PIN du magasin depuis localStorage ou depuis la base de données
    const storedPin = localStorage.getItem('shopPin');
    if (storedPin) {
      setShopPin(storedPin);
    } else if (shopId) {
      // Si pas de PIN stocké, le récupérer depuis la base de données
      fetchShopPin();
    }
  }, [shopId]);

  const fetchShopPin = async () => {
    if (!shopId) return;
    
    try {
      const { data: shopData, error } = await supabase
        .from('shops')
        .select('pin_code')
        .eq('id', shopId)
        .single();
      
      if (error) throw error;
      
      if (shopData?.pin_code) {
        setShopPin(shopData.pin_code);
        localStorage.setItem('shopPin', shopData.pin_code);
      }
    } catch (error) {
      console.error('Error fetching shop PIN:', error);
    }
  };

  const copyToClipboard = () => {
    if (shopPin) {
      navigator.clipboard.writeText(shopPin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const regeneratePin = async () => {
    if (!shopId) return;
    
    setRegenerating(true);
    try {
      // Générer un nouveau PIN via la fonction RPC
      const { data: newPin, error } = await supabase
        .rpc('generate_unique_pin_code');
      
      if (error) throw error;
      
      // Mettre à jour le PIN dans la base de données
      const { error: updateError } = await supabase
        .from('shops')
        .update({ pin_code: newPin })
        .eq('id', shopId);
      
      if (updateError) throw updateError;
      
      setShopPin(newPin);
      localStorage.setItem('shopPin', newPin);
      toast.success('Nouveau code PIN généré avec succès');
    } catch (error: any) {
      console.error('Error regenerating PIN:', error);
      toast.error('Erreur lors de la génération du nouveau code PIN');
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="shop-pin">Code PIN du magasin</Label>
        <div className="flex items-center space-x-2">
          <Input 
            id="shop-pin" 
            value={shopPin || 'Chargement...'} 
            readOnly
            className="font-mono text-lg bg-muted text-center tracking-widest"
          />
          <TooltipProvider>
            <Tooltip open={copied} onOpenChange={setCopied}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                  disabled={!shopPin}
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{copied ? 'Copié!' : 'Copier'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={regeneratePin}
                  disabled={!shopId || regenerating}
                >
                  <RefreshCw className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Générer un nouveau code PIN</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-sm text-muted-foreground">
          Ce code PIN à 6 chiffres identifie votre magasin. Partagez-le avec vos employés pour qu'ils puissent se connecter.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="invoice-prefix">Invoice Prefix</Label>
        <Input
          id="invoice-prefix"
          value={invoicePrefix}
          onChange={(e) => setInvoicePrefix(e.target.value)}
          placeholder="e.g. INV-"
        />
        <p className="text-sm text-muted-foreground">
          This prefix will be added to all invoice numbers.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="receipt-footer">Receipt Footer</Label>
        <Textarea
          id="receipt-footer"
          value={receiptFooter}
          onChange={(e) => setReceiptFooter(e.target.value)}
          placeholder="e.g. Thank you for your business!"
          rows={3}
        />
        <p className="text-sm text-muted-foreground">
          This message will appear at the bottom of all receipts.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="email-notifications">Email Notifications</Label>
          <p className="text-sm text-muted-foreground">
            Receive email notifications for new orders and low stock.
          </p>
        </div>
        <Switch
          id="email-notifications"
          checked={emailNotifications}
          onCheckedChange={setEmailNotifications}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="auto-backup">Automatic Backups</Label>
          <p className="text-sm text-muted-foreground">
            Automatically backup your data daily.
          </p>
        </div>
        <Switch
          id="auto-backup"
          checked={autoBackup}
          onCheckedChange={setAutoBackup}
        />
      </div>
    </div>
  );
};
