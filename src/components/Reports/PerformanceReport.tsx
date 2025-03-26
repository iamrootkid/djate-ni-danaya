
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const PerformanceReport = () => {
  const shopId = localStorage.getItem("shopId") || "";
  
  const { data: staff } = useQuery({
    queryKey: ["staff", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .eq("shop_id", shopId);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!shopId
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aperçu des performances du personnel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-6">
          {staff && staff.length > 0 ? (
            <div className="space-y-6">
              <p className="text-muted-foreground mb-4">
                Module en cours de développement. Les données historiques seront disponibles prochainement.
              </p>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {staff.map((employee) => (
                  <div key={employee.id} className="p-4 border rounded-lg">
                    <h3 className="font-medium">{employee.first_name} {employee.last_name}</h3>
                    <p className="text-sm text-muted-foreground">{employee.email}</p>
                    <p className="text-sm text-muted-foreground">Rôle: {employee.role}</p>
                    <div className="mt-2 flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: '70%' }}></div>
                      </div>
                      <span className="ml-2 text-sm font-medium">Performance estimée</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-lg text-muted-foreground text-center">
              Les données de performance du personnel ne sont pas encore disponibles.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
