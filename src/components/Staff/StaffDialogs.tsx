
import { DeleteDialog } from "@/components/ui/DeleteDialog";
import { StaffActions } from "./StaffActions";

interface StaffDialogsProps {
  deleteDialogOpen: boolean;
  onCloseDeleteDialog: () => void;
  onConfirmDelete: () => void;
  editDialogOpen: boolean;
  onCloseEditDialog: () => void;
  onSaveEdit: (data: any) => void;
  selectedEmployee: any;
}

export const StaffDialogs = ({
  deleteDialogOpen,
  onCloseDeleteDialog,
  onConfirmDelete,
  editDialogOpen,
  onCloseEditDialog,
  onSaveEdit,
  selectedEmployee,
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
    </>
  );
};
