import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BusinessSettingsForm } from "./BusinessSettingsForm";
import { SystemSettingsForm } from "./SystemSettingsForm";
import { Loader2 } from "lucide-react";
import { loadSettings, saveSettings } from "@/utils/settingsUtils";
import { useShopId } from "@/hooks/use-shop-id";

export const StoreSettingsForm = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { shopId } = useShopId();
  
  // Business Information
  const [storeName, setStoreName] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeEmail, setStoreEmail] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [openingTime, setOpeningTime] = useState("");
  const [closingTime, setClosingTime] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("UTC");

  // System Settings
  const [receiptFooter, setReceiptFooter] = useState("");
  const [invoicePrefix, setInvoicePrefix] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [autoBackup, setAutoBackup] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (shopId) {
      loadSettingsData();
    }
  }, [shopId]);

  const loadSettingsData = async () => {
    if (!shopId) return;
    
    try {
      setLoading(true);
      const data = await loadSettings(shopId);
      
      data.forEach((setting) => {
        switch (setting.key) {
          case "store_name":
            setStoreName(setting.value || "");
            break;
          case "store_phone":
            setStorePhone(setting.value || "");
            break;
          case "store_email":
            setStoreEmail(setting.value || "");
            break;
          case "store_address":
            setStoreAddress(setting.value || "");
            break;
          case "opening_time":
            setOpeningTime(setting.value || "");
            break;
          case "closing_time":
            setClosingTime(setting.value || "");
            break;
          case "tax_rate":
            setTaxRate(setting.value || "");
            break;
          case "currency":
            setCurrency(setting.value || "USD");
            break;
          case "timezone":
            setTimezone(setting.value || "UTC");
            break;
          case "receipt_footer":
            setReceiptFooter(setting.value || "");
            break;
          case "invoice_prefix":
            setInvoicePrefix(setting.value || "");
            break;
          case "email_notifications":
            setEmailNotifications(setting.value === "true");
            break;
          case "auto_backup":
            setAutoBackup(setting.value === "true");
            break;
        }
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!shopId) {
      toast({
        title: "Error",
        description: "Shop ID not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const settings = [
        { key: "store_name", value: storeName, shop_id: shopId },
        { key: "store_phone", value: storePhone, shop_id: shopId },
        { key: "store_email", value: storeEmail, shop_id: shopId },
        { key: "store_address", value: storeAddress, shop_id: shopId },
        { key: "opening_time", value: openingTime, shop_id: shopId },
        { key: "closing_time", value: closingTime, shop_id: shopId },
        { key: "tax_rate", value: taxRate, shop_id: shopId },
        { key: "currency", value: currency, shop_id: shopId },
        { key: "timezone", value: timezone, shop_id: shopId },
        { key: "receipt_footer", value: receiptFooter, shop_id: shopId },
        { key: "invoice_prefix", value: invoicePrefix, shop_id: shopId },
        { key: "email_notifications", value: emailNotifications.toString(), shop_id: shopId },
        { key: "auto_backup", value: autoBackup.toString(), shop_id: shopId },
      ];

      await saveSettings(settings, shopId);

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!shopId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <p className="text-muted-foreground">Loading shop information...</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Store Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="business" className="space-y-4">
          <TabsList>
            <TabsTrigger value="business">Business Information</TabsTrigger>
            <TabsTrigger value="system">System Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="business">
            <BusinessSettingsForm
              storeName={storeName}
              setStoreName={setStoreName}
              storePhone={storePhone}
              setStorePhone={setStorePhone}
              storeEmail={storeEmail}
              setStoreEmail={setStoreEmail}
              storeAddress={storeAddress}
              setStoreAddress={setStoreAddress}
              openingTime={openingTime}
              setOpeningTime={setOpeningTime}
              closingTime={closingTime}
              setClosingTime={setClosingTime}
              taxRate={taxRate}
              setTaxRate={setTaxRate}
              currency={currency}
              setCurrency={setCurrency}
              timezone={timezone}
              setTimezone={setTimezone}
            />
          </TabsContent>

          <TabsContent value="system">
            <SystemSettingsForm
              invoicePrefix={invoicePrefix}
              setInvoicePrefix={setInvoicePrefix}
              receiptFooter={receiptFooter}
              setReceiptFooter={setReceiptFooter}
              emailNotifications={emailNotifications}
              setEmailNotifications={setEmailNotifications}
              autoBackup={autoBackup}
              setAutoBackup={setAutoBackup}
            />
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <Button 
            onClick={handleSaveSettings} 
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};