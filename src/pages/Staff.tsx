import { AppLayout } from "@/components/Layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { StaffHeader } from "@/components/Staff/StaffHeader";
import { StaffTabs } from "@/components/Staff/StaffTabs";
import { StaffDialogs } from "@/components/Staff/StaffDialogs";
import { useShopId } from "@/hooks/use-shop-id";
import { Database } from "@/types/supabase";

type StaffMember = Database["public"]["Tables"]["staff"]["Row"];
type Department = Database["public"]["Tables"]["departments"]["Row"];

interface StaffEditData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  password?: string;
}

interface DepartmentData {
  name: string;
  description: string;
}

const Staff = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<StaffMember | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [deleteDepartmentDialogOpen, setDeleteDepartmentDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { shopId } = useShopId();

  const handleDelete = async () => {
    if (!selectedEmployee || !shopId) return;

    try {
      const { error } = await supabase
        .from("staff")
        .delete()
        .match({ id: selectedEmployee.id, shop_id: shopId });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ["staff", shopId] });
      setDeleteDialogOpen(false);
      setSelectedEmployee(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete employee",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (data: StaffEditData) => {
    if (!selectedEmployee || !shopId) return;

    try {
      const { error } = await supabase
        .from("staff")
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          ...(data.password && { password_hash: data.password }),
        })
        .match({ id: selectedEmployee.id, shop_id: shopId });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Employee updated successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ["staff", shopId] });
      setEditDialogOpen(false);
      setSelectedEmployee(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update employee",
        variant: "destructive",
      });
    }
  };

  const handleDepartmentSave = async (data: DepartmentData) => {
    if (!shopId) return;

    try {
      if (selectedDepartment) {
        const { error } = await supabase
          .from("departments")
          .update({
            name: data.name,
            description: data.description,
          })
          .match({ id: selectedDepartment.id, shop_id: shopId });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("departments")
          .insert({
            name: data.name,
            description: data.description,
            shop_id: shopId
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Department ${selectedDepartment ? "updated" : "added"} successfully`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["departments", shopId] });
      setDepartmentDialogOpen(false);
      setSelectedDepartment(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${selectedDepartment ? "update" : "add"} department`,
        variant: "destructive",
      });
    }
  };

  const handleDepartmentDelete = async () => {
    if (!selectedDepartment || !shopId) return;

    try {
      const { error } = await supabase
        .from("departments")
        .delete()
        .match({ id: selectedDepartment.id, shop_id: shopId });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Department deleted successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ["departments", shopId] });
      setDeleteDepartmentDialogOpen(false);
      setSelectedDepartment(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete department",
        variant: "destructive",
      });
    }
  };

  if (!shopId) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Please select a shop to manage staff.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <StaffHeader onSuccess={() => queryClient.invalidateQueries({ queryKey: ["staff", shopId] })} />
        <Card>
          <CardContent className="pt-6">
            <StaffTabs
              onEditEmployee={(employee) => {
                setSelectedEmployee(employee);
                setEditDialogOpen(true);
              }}
              onDeleteEmployee={(employee) => {
                setSelectedEmployee(employee);
                setDeleteDialogOpen(true);
              }}
              onAddDepartment={() => setDepartmentDialogOpen(true)}
              onEditDepartment={(department) => {
                setSelectedDepartment(department);
                setDepartmentDialogOpen(true);
              }}
              onDeleteDepartment={(department) => {
                setSelectedDepartment(department);
                setDeleteDepartmentDialogOpen(true);
              }}
            />
          </CardContent>
        </Card>
      </div>

      <StaffDialogs
        deleteDialogOpen={deleteDialogOpen}
        onCloseDeleteDialog={() => {
          setDeleteDialogOpen(false);
          setSelectedEmployee(null);
        }}
        onConfirmDelete={handleDelete}
        editDialogOpen={editDialogOpen}
        onCloseEditDialog={() => {
          setEditDialogOpen(false);
          setSelectedEmployee(null);
        }}
        onSaveEdit={handleEdit}
        selectedEmployee={selectedEmployee}
        departmentDialogOpen={departmentDialogOpen}
        onCloseDepartmentDialog={() => {
          setDepartmentDialogOpen(false);
          setSelectedDepartment(null);
        }}
        onSaveDepartment={handleDepartmentSave}
        selectedDepartment={selectedDepartment}
        deleteDepartmentDialogOpen={deleteDepartmentDialogOpen}
        onCloseDepartmentDeleteDialog={() => {
          setDeleteDepartmentDialogOpen(false);
          setSelectedDepartment(null);
        }}
        onConfirmDepartmentDelete={handleDepartmentDelete}
      />
    </AppLayout>
  );
};

export default Staff;