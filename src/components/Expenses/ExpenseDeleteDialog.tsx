
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "@/components/ui/DeleteDialog";
import { deleteExpense } from "./utils/expenseOperations";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

interface ExpenseDeleteDialogProps {
  expense: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ExpenseDeleteDialog = ({
  expense,
  isOpen,
  onClose,
  onSuccess,
}: ExpenseDeleteDialogProps) => {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  const deleteMutation = useMutation({
    mutationFn: () => deleteExpense(expense.id),
    onSuccess: () => {
      toast.success("Expense deleted successfully");
      onClose();
      setConfirmDialogOpen(false);
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete expense");
    }
  });

  const handleDelete = async () => {
    deleteMutation.mutate();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to delete this expense? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => setConfirmDialogOpen(true)}
              >
                Delete Expense
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        isOpen={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
      />
    </>
  );
};
