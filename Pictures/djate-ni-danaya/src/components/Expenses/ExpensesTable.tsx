
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Expense } from "@/types/expense";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ExpensesTableProps {
  expenses: Expense[] | undefined;
  onActionSelect: (expense: Expense, mode: "edit" | "delete") => void;
}

export const ExpensesTable = ({ expenses, onActionSelect }: ExpensesTableProps) => {
  const typeLabels: Record<string, string> = {
    salary: "Salaire",
    commission: "Commission",
    utility: "Facture",
    shop_maintenance: "Maintenance",
    stock_purchase: "Achat de stock",
    loan_shop: "Prêt boutique",
    other: "Autre",
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Montant</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Employé</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses?.map((expense) => (
          <TableRow key={expense.id}>
            <TableCell>
              {new Date(expense.date).toLocaleDateString()}
            </TableCell>
            <TableCell>{typeLabels[expense.type]}</TableCell>
            <TableCell>{expense.amount.toLocaleString()} F CFA</TableCell>
            <TableCell>{expense.description || "-"}</TableCell>
            <TableCell>
              {expense.profiles
                ? `${expense.profiles.first_name || ''} ${expense.profiles.last_name || ''}`
                : "-"}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => onActionSelect(expense, "edit")}
                  >
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onActionSelect(expense, "delete")}
                  >
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
