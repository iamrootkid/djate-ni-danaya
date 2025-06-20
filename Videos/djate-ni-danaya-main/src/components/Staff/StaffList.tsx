import { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { User, UserRound, UserPlus, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useShopId } from "@/hooks/use-shop-id";
import { asAny } from "@/utils/safeFilters";

// Define explicit type for staff item to avoid recursive type instantiation
interface StaffItem {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  email: string;
  phone: string | null;
  shop_id: string;
  created_at: string;
  updated_at: string;
}

export const StaffList = () => {
  const { shopId } = useShopId();

  const fetchStaff = useCallback(async () => {
    if (!shopId) {
      throw new Error("No shop ID found");
    }

    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .eq("shop_id", shopId)
      .order("first_name", { ascending: true });

    if (error) {
      throw error;
    }

    return asAny(data);
  }, [shopId]);

  const { data: staff, isLoading, error } = useQuery({
    queryKey: ["staff", shopId],
    queryFn: fetchStaff,
    enabled: !!shopId,
  });

  if (isLoading) {
    return <StaffListSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>Une erreur est survenue lors du chargement du personnel.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="grid gap-4 pt-6">
        <div className="flex items-center space-x-2">
          <UserPlus className="h-4 w-4" />
          <h2 className="text-lg font-semibold">Liste du personnel</h2>
        </div>
        {!staff || staff.length === 0 ? (
          <p>Aucun membre du personnel trouvé.</p>
        ) : (
          <div className="grid gap-2">
            {staff.map((member) => (
              <div
                key={member.id}
                className="flex items-center space-x-4 rounded-md border p-3 shadow-sm"
              >
                <UserRound className="h-8 w-8" />
                <div>
                  <p className="text-sm font-medium">{member.first_name} {member.last_name}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                  <p className="text-xs text-muted-foreground">Role: {member.role}</p>
                  {member.phone && (
                    <p className="text-xs text-muted-foreground">Téléphone: {member.phone}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Create a skeleton loader component for StaffList
const StaffListSkeleton = () => {
  return (
    <Card>
      <CardContent className="grid gap-4 pt-6">
        <div className="flex items-center space-x-2">
          <UserPlus className="h-4 w-4" />
          <h2 className="text-lg font-semibold">Liste du personnel</h2>
        </div>
        <div className="grid gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 rounded-md border p-3 shadow-sm"
            >
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
