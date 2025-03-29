import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useShopId } from "@/hooks/use-shop-id";
import { CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";

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

  const copyToClipboard = () => {
    if (shopId) {
      navigator.clipboard.writeText(shopId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="shop-id">Shop ID</Label>
        <div className="flex items-center space-x-2">
          <Input 
            id="shop-id" 
            value={shopId || 'Loading...'} 
            readOnly
            className="font-mono text-sm bg-muted"
          />
          <TooltipProvider>
            <Tooltip open={copied} onOpenChange={setCopied}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                  disabled={!shopId}
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{copied ? 'Copied!' : 'Copy to clipboard'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-sm text-muted-foreground">
          This is your shop's unique identifier. You'll need this when logging in.
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