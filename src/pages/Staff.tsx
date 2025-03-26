import { AppLayout } from "@/components/Layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { StaffHeader } from "@/components/Staff/StaffHeader";
import { StaffTabs } from "@/components/Staff/StaffTabs";
import { StaffDialogs } from "@/components/Staff/StaffDialogs";

const Staff = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [deleteDepartmentDialogOpen, setDeleteDepartmentDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!selectedEmployee) return;

    try {
      // Delete the employee from the staff table
      const { error } = await supabase
        .from("staff")
        .delete()
        .eq("id", selectedEmployee.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ["employees"] });
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

  const handleEdit = async (data: any) => {
    if (!selectedEmployee) return;

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
        .eq("id", selectedEmployee.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Employee updated successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ["employees"] });
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

  const handleDepartmentSave = async (data: any) => {
    try {
      if (selectedDepartment) {
        const { error } = await supabase
          .from("departments")
          .update({
            name: data.name,
            description: data.description,
          })
          .eq("id", selectedDepartment.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("departments")
          .insert({
            name: data.name,
            description: data.description,
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Department ${selectedDepartment ? "updated" : "added"} successfully`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["departments"] });
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
    if (!selectedDepartment) return;

    try {
      const { error } = await supabase
        .from("departments")
        .delete()
        .eq("id", selectedDepartment.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Department deleted successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ["departments"] });
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

  return (
    <AppLayout>
      <div className="space-y-6">
        <StaffHeader onSuccess={() => queryClient.invalidateQueries({ queryKey: ["employees"] })} />
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