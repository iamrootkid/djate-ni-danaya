
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "@/components/ui/DeleteDialog";
import { deleteExpense } from "./utils/expenseOperations";
import { useToast } from "@/components/ui/use-toast";

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
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteExpense(expense.id);
      
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
      
      onClose();
      setConfirmDialogOpen(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete expense",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
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
        isDeleting={isDeleting}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
      />
    </>
  );
};
