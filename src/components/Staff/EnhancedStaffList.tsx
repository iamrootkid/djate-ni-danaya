import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useShopId } from "@/hooks/use-shop-id";
import { Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { asAny } from "@/utils/safeFilters";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

// Explicitly define the types to prevent recursive type instantiation
type StaffMember = {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: string;
  shop_id: string | null;
  updated_at: string;
};

interface EnhancedStaffListProps {
  onEdit: (item: StaffMember) => void;
  onDelete: (item: StaffMember) => void;
}

export const EnhancedStaffList = ({ onEdit, onDelete }: EnhancedStaffListProps) => {
  const { shopId } = useShopId();
  const isMobile = useIsMobile();

  const { data: staff, isLoading } = useQuery({
    queryKey: ["staff", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return asAny(data) as StaffMember[];
    },
    enabled: !!shopId,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('fr-FR', { 
      month: 'long', 
      day: 'numeric',
    })}, ${date.getFullYear()}`;
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-[#18181b] rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Employés</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <StaffListSkeleton />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isMobile) {
    return (
      <Card className="bg-white dark:bg-[#18181b] rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Employés</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="py-2">
            {!staff?.length ? (
              <div className="text-center text-muted-foreground py-6">
                Aucun employé trouvé
              </div>
            ) : (
              staff.map((member) => (
                <div
                  key={member.id}
                  className="bg-white dark:bg-[#18181b] rounded-xl mb-4 p-4 border border-border shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-lg font-bold text-foreground">
                      {member.first_name} {member.last_name}
                    </div>
                    <div className="flex gap-2 bg-[#f6f7fa] dark:bg-gray-800 rounded-xl p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(member)}
                        className="hover:bg-[#ececec] dark:hover:bg-gray-700"
                        aria-label="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(member)}
                        className="hover:bg-[#ececec] dark:hover:bg-gray-700"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground min-w-[60px]">Email:</span>
                      <span className="text-sm text-foreground break-all">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground min-w-[60px]">Role:</span>
                      <Badge
                        variant={member.role === 'admin' ? 'secondary' : 'outline'}
                        className={`px-3 py-1 rounded-xl font-bold text-sm ${
                          member.role === 'admin'
                            ? 'bg-[#009ee2] text-white'
                            : 'bg-[#e0e0e0] text-[#222] dark:bg-gray-700 dark:text-gray-200'
                        }`}
                      >
                        {member.role === 'admin' ? 'Admin' : 'Employee'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground min-w-[60px]">Status:</span>
                      <Badge className="bg-[#22c55e] text-white px-3 py-1 rounded-xl font-bold text-sm">
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground min-w-[60px]">Created:</span>
                      <span className="text-sm text-foreground">{formatDate(member.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-[#18181b] rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-foreground">Employés</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto w-full">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow className="border-b border-border">
                <TableHead className="font-bold text-foreground text-[15px]">Nom</TableHead>
                <TableHead className="font-bold text-foreground text-[15px]">Email</TableHead>
                <TableHead className="font-bold text-foreground text-[15px]">Rôle</TableHead>
                <TableHead className="font-bold text-foreground text-[15px]">Statut</TableHead>
                <TableHead className="font-bold text-foreground text-[15px]">Créé le</TableHead>
                <TableHead className="text-right font-bold text-foreground text-[15px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!staff?.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Aucun employé trouvé
                  </TableCell>
                </TableRow>
              ) : (
                staff.map((member) => (
                  <TableRow key={member.id} className="border-b border-border/50">
                    <TableCell className="font-medium text-[15px] text-foreground">
                      {`${member.first_name} ${member.last_name}`}
                    </TableCell>
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
                        {member.role === 'admin' ? 'Admin' : 'Employé'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-[#22c55e] text-white px-3 py-1 rounded-xl font-bold text-sm">
                        Actif
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[15px] text-foreground">{formatDate(member.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(member)}
                          className="bg-[#f6f7fa] hover:bg-[#f6f7fa]/80 dark:bg-gray-800"
                        >
                          <Edit className="h-4 w-4" />
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

const StaffListSkeleton = () => {
  return (
    <div className="overflow-x-auto w-full">
      <Table className="min-w-[700px]">
        <TableHeader>
          <TableRow className="border-b border-border">
            <TableHead className="font-bold text-foreground text-[15px]">Nom</TableHead>
            <TableHead className="font-bold text-foreground text-[15px]">Email</TableHead>
            <TableHead className="font-bold text-foreground text-[15px]">Rôle</TableHead>
            <TableHead className="font-bold text-foreground text-[15px]">Statut</TableHead>
            <TableHead className="font-bold text-foreground text-[15px]">Créé le</TableHead>
            <TableHead className="text-right font-bold text-foreground text-[15px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array(5).fill(0).map((_, i) => (
            <TableRow key={i} className="border-b border-border/50">
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell><Skeleton className="h-5 w-32" /></TableCell>
              <TableCell><Skeleton className="h-5 w-20" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16" /></TableCell>
              <TableCell><Skeleton className="h-5 w-20" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
