import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
        <Input
          id="invoicePrefix"
          value={invoicePrefix}
          onChange={(e) => setInvoicePrefix(e.target.value)}
          placeholder="Enter invoice prefix"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="receiptFooter">Receipt Footer Message</Label>
        <Textarea
          id="receiptFooter"
          value={receiptFooter}
          onChange={(e) => setReceiptFooter(e.target.value)}
          placeholder="Enter receipt footer message"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="emailNotifications"
          checked={emailNotifications}
          onCheckedChange={setEmailNotifications}
        />
        <Label htmlFor="emailNotifications">Enable Email Notifications</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="autoBackup"
          checked={autoBackup}
          onCheckedChange={setAutoBackup}
        />
        <Label htmlFor="autoBackup">Enable Automatic Backups</Label>
      </div>
    </div>
  );
};