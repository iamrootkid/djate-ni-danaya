
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useShopId } from "@/hooks/use-shop-id";
import { Skeleton } from "@/components/ui/skeleton";
import { isQueryError } from "@/utils/safeFilters";

export const EmployeeList = () => {
  const { shopId } = useShopId();
  
  const { data: employees, isLoading } = useQuery({
    queryKey: ["employees", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .eq("shop_id", shopId as any)
        .order("created_at", { ascending: false }) as any;
        
      if (error) throw error;
      
      // Filter out query error objects if any
      return Array.isArray(data) 
        ? data.filter(emp => !isQueryError(emp))
        : [];
    },
    enabled: !!shopId,
  });

  if (isLoading) {
    return <EmployeeListSkeleton />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Rôle</TableHead>
          <TableHead>Téléphone</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {!employees?.length ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-4">
              Aucun employé trouvé
            </TableCell>
          </TableRow>
        ) : (
          employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>{`${employee.first_name} ${employee.last_name}`}</TableCell>
              <TableCell>{employee.email}</TableCell>
              <TableCell className="capitalize">
                {employee.role === 'admin' ? 'Administrateur' : 'Employé'}
              </TableCell>
              <TableCell>{employee.phone || "N/A"}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

const EmployeeListSkeleton = () => (
  <div>
    <Skeleton className="h-10 w-full mb-2" />
    <Skeleton className="h-12 w-full mb-1" />
    <Skeleton className="h-12 w-full mb-1" />
    <Skeleton className="h-12 w-full" />
  </div>
);
