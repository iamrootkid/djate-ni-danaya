import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type TableName =
  | "categories"
  | "departments"
  | "expenses"
  | "invoices"
  | "products"
  | "profiles"
  | "sale_items"
  | "sales"
  | "settings"
  | "shops"
  | "staff";

type TableRow<T extends TableName> = Database["public"]["Tables"][T]["Row"];
type TableInsert<T extends TableName> = Database["public"]["Tables"][T]["Insert"];
type TableUpdate<T extends TableName> = Database["public"]["Tables"][T]["Update"];

export const useShopData = () => {
  const queryClient = useQueryClient();
  const shopId = localStorage.getItem("shopId");

  const getShopId = () => {
    if (!shopId) {
      throw new Error("No shop ID found. User should be redirected to login.");
    }
    return shopId;
  };

  const useShopQuery = <T extends TableName>(
    queryKey: string[],
    table: T,
    options: {
      select?: string;
      filters?: Record<string, any>;
      enabled?: boolean;
    } = {}
  ) => {
    return useQuery<TableRow<T>[]>({
      queryKey: [...queryKey, shopId],
      queryFn: async () => {
        let query = supabase
          .from(table)
          .select(options.select || "*");

        // Add shop_id filter
        query = query.filter("shop_id", "eq", getShopId());

        // Add additional filters
        if (options.filters) {
          Object.entries(options.filters).forEach(([key, value]) => {
            query = query.filter(key, "eq", value);
          });
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as unknown as TableRow<T>[];
      },
      enabled: !!shopId && (options.enabled ?? true),
    });
  };

  const useShopMutation = <T extends TableName>(
    table: T,
    options: {
      onSuccess?: (data: TableRow<T> | null) => void;
      onError?: (error: any) => void;
    } = {}
  ) => {
    const mutate = async (data: TableInsert<T>) => {
      try {
        const insertData = { ...data, shop_id: getShopId() } as any;
        const { data: result, error } = await supabase
          .from(table)
          .insert(insertData)
          .select()
          .single();

        if (error) throw error;
        const typedResult = result as unknown as TableRow<T>;
        options.onSuccess?.(typedResult);
        return typedResult;
      } catch (error) {
        options.onError?.(error);
        throw error;
      }
    };

    const update = async (id: string, data: TableUpdate<T>) => {
      try {
        const updateData = data as any;
        const { data: result, error } = await supabase
          .from(table)
          .update(updateData)
          .filter("id", "eq", id)
          .filter("shop_id", "eq", getShopId())
          .select()
          .single();

        if (error) throw error;
        const typedResult = result as unknown as TableRow<T>;
        options.onSuccess?.(typedResult);
        return typedResult;
      } catch (error) {
        options.onError?.(error);
        throw error;
      }
    };

    const remove = async (id: string) => {
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .filter("id", "eq", id)
          .filter("shop_id", "eq", getShopId());

        if (error) throw error;
        options.onSuccess?.(null);
      } catch (error) {
        options.onError?.(error);
        throw error;
      }
    };

    return { mutate, update, remove };
  };

  return {
    shopId: getShopId(),
    useShopQuery,
    useShopMutation,
    invalidateQueries: (queryKey: string[]) => 
      queryClient.invalidateQueries({ queryKey: [...queryKey, shopId] }),
  };
}; 