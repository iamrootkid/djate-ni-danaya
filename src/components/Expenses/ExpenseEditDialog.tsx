
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExpenseType } from "@/types/expense";
import { updateExpense } from "./utils/expenseOperations";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

interface ExpenseEditDialogProps {
  expense: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ExpenseEditDialog = ({
  expense,
  isOpen,
  onClose,
  onSuccess,
}: ExpenseEditDialogProps) => {
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [expenseType, setExpenseType] = useState<ExpenseType>("other");

  useEffect(() => {
    if (expense) {
      setAmount(Number(expense.amount));
      setDescription(expense.description || "");
      setExpenseType(expense.type as ExpenseType);
    }
  }, [expense]);

  const updateMutation = useMutation({
    mutationFn: () => updateExpense(expense.id, {
      amount,
      description,
      type: expenseType,
    }),
    onSuccess: () => {
      toast.success("Expense updated successfully");
      onClose();
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update expense");
    }
  });

  const handleEdit = () => {
    updateMutation.mutate();
  };

  const handleTypeChange = (value: string) => {
    // Only set the type if it's a valid ExpenseType
    if (["salary", "stock_purchase", "commission", "utility", "shop_maintenance", "loan_shop", "other"].includes(value)) {
      setExpenseType(value as ExpenseType);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />
          </div>
          <div>
            <Label htmlFor="type">Type</Label>
            <Select value={expenseType} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="salary">Salary</SelectItem>
                <SelectItem value="stock_purchase">Stock Purchase</SelectItem>
                <SelectItem value="commission">Commission</SelectItem>
                <SelectItem value="utility">Utility</SelectItem>
                <SelectItem value="shop_maintenance">Shop Maintenance</SelectItem>
                <SelectItem value="loan_shop">Loan / Shop</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Updating..." : "Update Expense"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
