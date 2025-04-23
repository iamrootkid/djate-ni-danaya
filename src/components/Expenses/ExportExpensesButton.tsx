
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Expense } from "@/types/expense";
import { toast } from "sonner";

interface ExportExpensesButtonProps {
  expenses: Expense[] | undefined;
}

export const ExportExpensesButton = ({ expenses }: ExportExpensesButtonProps) => {
  const typeLabels: Record<string, string> = {
    salary: "Salaire",
    commission: "Commission",
    utility: "Facture",
    shop_maintenance: "Maintenance",
    stock_purchase: "Achat de stock",
    loan_shop: "Prêt boutique",
    other: "Autre",
  };

  const handleExport = () => {
    if (!expenses?.length) {
      toast.error("Aucune dépense à exporter");
      return;
    }

    const headers = ["Date", "Type", "Montant", "Description", "Employé"];
    const csvContent = [
      headers.join(","),
      ...expenses.map(expense => [
        new Date(expense.date).toLocaleDateString(),
        typeLabels[expense.type],
        expense.amount,
        `"${expense.description || ''}"`,
        expense.profiles ? `${expense.profiles.first_name || ''} ${expense.profiles.last_name || ''}` : ''
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `depenses_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      variant="outline"
      className="flex items-center gap-2"
      onClick={handleExport}
    >
      <Download className="h-4 w-4" />
      Exporter
    </Button>
  );
};
