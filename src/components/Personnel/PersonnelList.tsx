
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button"; 
import { Pencil, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useShopId } from "@/hooks/use-shop-id";
import { Database } from "@/types/supabase";
import { safeQueryWithRateLimit, safeTypeAssert } from "@/utils/supabaseHelpers";

type StaffMember = Database["public"]["Tables"]["staff"]["Row"];

interface PersonnelListProps {
  onEdit: (personnel: StaffMember) => void;
  onDelete: (personnel: StaffMember) => void;
}

export const PersonnelList = ({ onEdit, onDelete }: PersonnelListProps) => {
  const { shopId } = useShopId();
  
  const { data: employees, isLoading } = useQuery({
    queryKey: ["personnel", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      
      return safeQueryWithRateLimit(`personnel-${shopId}`, async () => {
        const { data, error } = await supabase
          .from("staff")
          .select("*")
          .eq("shop_id", shopId)
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        
        // Use type assertion with fallback for safety
        return safeTypeAssert<StaffMember[]>(data, []);
      });
    },
    enabled: !!shopId,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!employees?.length) {
    return <div className="text-center text-muted-foreground">No personnel found</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((member) => (
          <TableRow key={member.id}>
            <TableCell>{`${member.first_name} ${member.last_name}`}</TableCell>
            <TableCell>{member.email}</TableCell>
            <TableCell>{member.phone || "-"}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(member)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(member)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
