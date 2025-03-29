import { useQuery } from "@tanstack/react-query";
import { loadSettings, Setting } from "@/utils/settingsUtils";
import { useShopId } from "./use-shop-id";

export interface ShopSettings {
  storeName: string;
  storePhone: string;
  storeEmail: string;
  storeAddress: string;
  taxRate: string;
  currency: string;
  timezone: string;
  receiptFooter: string;
  invoicePrefix: string;
}

const defaultSettings: ShopSettings = {
  storeName: "",
  storePhone: "",
  storeEmail: "",
  storeAddress: "",
  taxRate: "0",
  currency: "XOF",
  timezone: "UTC",
  receiptFooter: "",
  invoicePrefix: "",
};

export const useShopSettings = () => {
  const { shopId } = useShopId();

  const { data: settings, isLoading, error } = useQuery<Setting[], Error>({
    queryKey: ["shopSettings", shopId],
    queryFn: async () => {
      if (!shopId) throw new Error("Shop ID is required");
      return loadSettings(shopId);
    },
    enabled: !!shopId,
  });

  const formattedSettings: ShopSettings = settings?.reduce((acc, setting) => {
    switch (setting.key) {
      case "store_name":
        return { ...acc, storeName: setting.value };
      case "store_phone":
        return { ...acc, storePhone: setting.value };
      case "store_email":
        return { ...acc, storeEmail: setting.value };
      case "store_address":
        return { ...acc, storeAddress: setting.value };
      case "tax_rate":
        return { ...acc, taxRate: setting.value };
      case "currency":
        return { ...acc, currency: setting.value };
      case "timezone":
        return { ...acc, timezone: setting.value };
      case "receipt_footer":
        return { ...acc, receiptFooter: setting.value };
      case "invoice_prefix":
        return { ...acc, invoicePrefix: setting.value };
      default:
        return acc;
    }
  }, defaultSettings) || defaultSettings;

  return {
    settings: formattedSettings,
    isLoading,
    error,
  };
}; 