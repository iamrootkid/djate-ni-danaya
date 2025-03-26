
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Pencil } from "lucide-react";
import { ExpenseDeleteDialog } from "./ExpenseDeleteDialog";
import { ExpenseEditDialog } from "./ExpenseEditDialog";
import { ExpenseExportDialog } from "./ExpenseExportDialog";
import { Expense } from "@/types/expense";

type ExpenseAction = "export" | "edit" | "delete";

interface ExpenseActionButtonProps {
  expense: Expense;
  action: ExpenseAction;
  onSuccess: () => void;
}

export const ExpenseActionButton = ({ expense, action, onSuccess }: ExpenseActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getActionButton = () => {
    switch (action) {
      case "export":
        return (
          <Button variant="outline" onClick={() => setIsOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        );
      case "delete":
        return (
          <Button variant="destructive" size="icon" onClick={() => setIsOpen(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        );
      case "edit":
        return (
          <Button variant="outline" size="icon" onClick={() => setIsOpen(true)}>
            <Pencil className="h-4 w-4" />
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {getActionButton()}

      {action === "export" && (
        <ExpenseExportDialog
          expense={expense}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}

      {action === "delete" && (
        <ExpenseDeleteDialog
          expense={expense}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSuccess={onSuccess}
        />
      )}

      {action === "edit" && (
        <ExpenseEditDialog
          expense={expense}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
};
