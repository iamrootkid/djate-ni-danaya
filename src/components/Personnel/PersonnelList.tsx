import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button"; 
import { Pencil, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useShopId } from "@/hooks/use-shop-id";
import { TableRow as StaffRow } from "@/utils/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

type StaffMember = StaffRow<"staff">;

interface PersonnelListProps {
  onEdit: (personnel: StaffMember) => void;
  onDelete: (personnel: StaffMember) => void;
}

export const PersonnelList = ({ onEdit, onDelete }: PersonnelListProps) => {
  const { shopId } = useShopId();
  const isMobile = useIsMobile();
  
  const { data: employees, isLoading } = useQuery({
    queryKey: ["personnel", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .eq("shop_id", shopId as any)
        .order("created_at", { ascending: false }) as any;
      
      if (error) throw error;
      return data as StaffMember[];
    },
    enabled: !!shopId,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!employees?.length) {
    return <div className="text-center text-muted-foreground">No personnel found</div>;
  }

  if (isMobile) {
    return (
      <div className="py-2">
        {employees.map((member) => (
          <div key={member.id} className="bg-white dark:bg-[#18181b] rounded-xl mb-3 p-4 border border-border shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <div className="text-lg font-bold text-foreground">{member.first_name} {member.last_name}</div>
              <Badge 
                variant={member.role === 'admin' ? 'secondary' : 'outline'}
                className={`px-3 py-1 rounded-xl font-bold text-sm ${
                  member.role === 'admin' 
                    ? 'bg-[#009ee2] text-white' 
                    : 'bg-[#e0e0e0] text-[#222] dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                {member.role === 'admin' ? 'Admin' : member.role === 'owner' ? 'Owner' : 'Employé'}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-20">Email:</span>
                <span className="text-sm text-foreground flex-1">{member.email}</span>
              </div>
              {member.phone && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-20">Phone:</span>
                  <span className="text-sm text-foreground flex-1">{member.phone}</span>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(member)}
                className="bg-[#f6f7fa] hover:bg-[#f6f7fa]/80 dark:bg-gray-800"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(member)}
                className="bg-[#f6f7fa] hover:bg-[#f6f7fa]/80 dark:bg-gray-800"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#18181b] rounded-xl shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border">
            <TableHead className="font-bold text-foreground text-[15px]">Name</TableHead>
            <TableHead className="font-bold text-foreground text-[15px]">Email</TableHead>
            <TableHead className="font-bold text-foreground text-[15px]">Role</TableHead>
            <TableHead className="font-bold text-foreground text-[15px]">Status</TableHead>
            <TableHead className="text-right font-bold text-foreground text-[15px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((member) => (
            <TableRow key={member.id} className="border-b border-border/50">
              <TableCell className="text-[15px] text-foreground">{`${member.first_name} ${member.last_name}`}</TableCell>
              <TableCell className="text-[15px] text-foreground">{member.email}</TableCell>
              <TableCell>
                <Badge 
                  variant={member.role === 'admin' ? 'secondary' : 'outline'}
                  className={`px-3 py-1 rounded-xl font-bold text-sm ${
                    member.role === 'admin' 
                      ? 'bg-[#009ee2] text-white' 
                      : 'bg-[#e0e0e0] text-[#222] dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  {member.role === 'admin' ? 'Admin' : member.role === 'owner' ? 'Owner' : 'Employé'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className="bg-[#22c55e] text-white px-3 py-1 rounded-xl font-bold text-sm">
                  Active
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(member)}
                    className="bg-[#f6f7fa] hover:bg-[#f6f7fa]/80 dark:bg-gray-800"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(member)}
                    className="bg-[#f6f7fa] hover:bg-[#f6f7fa]/80 dark:bg-gray-800"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
