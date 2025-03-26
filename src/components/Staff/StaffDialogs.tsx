import { DeleteDialog } from "@/components/ui/DeleteDialog";
import { StaffActions } from "./StaffActions";
import { DepartmentDialog } from "./DepartmentDialog";

interface StaffDialogsProps {
  deleteDialogOpen: boolean;
  onCloseDeleteDialog: () => void;
  onConfirmDelete: () => void;
  editDialogOpen: boolean;
  onCloseEditDialog: () => void;
  onSaveEdit: (data: any) => void;
  selectedEmployee: any;
  departmentDialogOpen: boolean;
  onCloseDepartmentDialog: () => void;
  onSaveDepartment: (data: any) => void;
  selectedDepartment: any;
  deleteDepartmentDialogOpen: boolean;
  onCloseDepartmentDeleteDialog: () => void;
  onConfirmDepartmentDelete: () => void;
}

export const StaffDialogs = ({
  deleteDialogOpen,
  onCloseDeleteDialog,
  onConfirmDelete,
  editDialogOpen,
  onCloseEditDialog,
  onSaveEdit,
  selectedEmployee,
  departmentDialogOpen,
  onCloseDepartmentDialog,
  onSaveDepartment,
  selectedDepartment,
  deleteDepartmentDialogOpen,
  onCloseDepartmentDeleteDialog,
  onConfirmDepartmentDelete,
}: StaffDialogsProps) => {
  return (
    <>
      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={onCloseDeleteDialog}
        onConfirm={onConfirmDelete}
        title="Delete Employee"
        description="Are you sure you want to delete this employee? This action cannot be undone."
      />

      {selectedEmployee && (
        <StaffActions
          isOpen={editDialogOpen}
          onClose={onCloseEditDialog}
          onSave={onSaveEdit}
          employee={selectedEmployee}
        />
      )}

      <DepartmentDialog
        isOpen={departmentDialogOpen}
        onClose={onCloseDepartmentDialog}
        onSave={onSaveDepartment}
        department={selectedDepartment}
      />

      <DeleteDialog
        isOpen={deleteDepartmentDialogOpen}
        onClose={onCloseDepartmentDeleteDialog}
        onConfirm={onConfirmDepartmentDelete}
        title="Delete Department"
        description="Are you sure you want to delete this department? This action cannot be undone."
      />
    </>
  );
};