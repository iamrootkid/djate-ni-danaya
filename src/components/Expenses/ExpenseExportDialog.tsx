
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { exportExpenseToCsv } from "./utils/expenseOperations";
import { useToast } from "@/components/ui/use-toast";

interface ExpenseExportDialogProps {
  expense: any;
  isOpen: boolean;
  onClose: () => void;
}

export const ExpenseExportDialog = ({
  expense,
  isOpen,
  onClose,
}: ExpenseExportDialogProps) => {
  const { toast } = useToast();

  const handleExport = () => {
    exportExpenseToCsv(expense);
    onClose();
    toast({
      title: "Success",
      description: "Expense exported as CSV",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Expense</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <p className="mt-1">{expense?.date}</p>
            </div>
            <div>
              <Label>Type</Label>
              <p className="mt-1 capitalize">{expense?.type}</p>
            </div>
            <div>
              <Label>Amount</Label>
              <p className="mt-1">{expense?.amount} F CFA</p>
            </div>
            <div>
              <Label>Description</Label>
              <p className="mt-1">{expense?.description || "N/A"}</p>
            </div>
          </div>
          <Button onClick={handleExport} className="w-full">
            Export as CSV
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
