
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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

type Department = {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
  shop_id: string;
};

interface EnhancedStaffListProps {
  onEdit: (item: StaffMember | Department) => void;
  onDelete: (item: StaffMember | Department) => void;
}

export const EnhancedStaffList = ({ onEdit, onDelete }: EnhancedStaffListProps) => {
  const { shopId } = useShopId();
  const [activeTab, setActiveTab] = useState("employees");

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
      return data as StaffMember[];
    },
    enabled: !!shopId,
  });

  const { data: departments } = useQuery({
    queryKey: ["departments", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .eq("shop_id", shopId)
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Department[];
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
    return <StaffListSkeleton />;
  }

  return (
    <Tabs defaultValue="employees" onValueChange={setActiveTab} className="w-full">
      <TabsList>
        <TabsTrigger value="employees">Employees</TabsTrigger>
        <TabsTrigger value="departments">Departments</TabsTrigger>
      </TabsList>
      
      <TabsContent value="employees" className="pt-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stock Managed</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!staff?.length ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No employees found
                  </TableCell>
                </TableRow>
              ) : (
                staff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {`${member.first_name} ${member.last_name}`}
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Badge variant={member.role === 'admin' ? 'secondary' : 'outline'}>
                        {member.role === 'admin' ? 'Admin' : 'Employee'}
                      </Badge>
                    </TableCell>
                    <TableCell>N/A</TableCell>
                    <TableCell>
                      <Badge variant="success" className="bg-green-500 hover:bg-green-600">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell>43 units</TableCell>
                    <TableCell>{formatDate(member.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(member)}
                        >
                          <Edit className="h-4 w-4" />
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
      
      <TabsContent value="departments" className="pt-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Number of Employees</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!departments?.length ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No departments found
                  </TableCell>
                </TableRow>
              ) : (
                departments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell className="font-medium">{department.name}</TableCell>
                    <TableCell>{department.description || "No description"}</TableCell>
                    <TableCell>0</TableCell> {/* This would need data linking staff to departments */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(department)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(department)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  );
};

const StaffListSkeleton = () => {
  return (
    <div className="space-y-3">
      <div className="flex space-x-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
      
      <div className="rounded-md border">
        <div className="py-3 px-4 border-b">
          <div className="grid grid-cols-8 gap-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
        
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="py-4 px-4 border-b">
            <div className="grid grid-cols-8 gap-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-20 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
