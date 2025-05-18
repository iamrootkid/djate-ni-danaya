import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Setting {
  key: string;
  value: string;
  shop_id: string;
}

interface DatabaseSetting {
  id: number;
  key: string;
  value: string;
  shop_id: string;
  created_at: string;
  updated_at: string;
}

export const saveSettings = async (settings: Setting[], shopId: string) => {
  try {
    if (!shopId) {
      throw new Error("Shop ID is required");
    }

    // First, get all existing settings for this shop
    // @ts-ignore - Known issue with TypeScript type inference for Supabase queries
    const { data: existingSettings, error: fetchError } = await supabase
      .from("settings")
      .select("key")
      .eq("shop_id", shopId);

    if (fetchError) throw fetchError;

    const existingKeys = new Set((existingSettings || []).map((setting: { key: string }) => setting.key));
    
    // Add shop_id to all settings
    const settingsWithShopId = settings.map(setting => ({
      ...setting,
      shop_id: shopId
    }));
    
    // Separate settings into updates and inserts
    const updates = settingsWithShopId.filter(setting => existingKeys.has(setting.key));
    const inserts = settingsWithShopId.filter(setting => !existingKeys.has(setting.key));

    // Handle updates
    if (updates.length > 0) {
      const { error: updateError } = await supabase
        .from("settings")
        .upsert(updates, { 
          onConflict: 'key,shop_id',
          ignoreDuplicates: false 
        });

      if (updateError) throw updateError;
    }

    // Handle inserts
    if (inserts.length > 0) {
      const { error: insertError } = await supabase
        .from("settings")
        .insert(inserts);

      if (insertError) throw insertError;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error saving settings:", error);
    throw error;
  }
};

export const loadSettings = async (shopId: string): Promise<Setting[]> => {
  try {
    if (!shopId) {
      throw new Error("Shop ID is required");
    }

    // @ts-ignore - Known issue with TypeScript type inference for Supabase queries
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("shop_id", shopId);

    if (error) throw error;

    // Convert database settings to our Setting type
    return (data || []).map((dbSetting: DatabaseSetting) => ({
      key: dbSetting.key,
      value: dbSetting.value,
      shop_id: dbSetting.shop_id
    }));
  } catch (error: any) {
    console.error("Error loading settings:", error);
    throw error;
  }
};