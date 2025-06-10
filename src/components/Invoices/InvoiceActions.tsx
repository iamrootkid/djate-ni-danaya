
import { Button } from "@/components/ui/button";
import { Eye, FileDown } from "lucide-react";
import { Invoice } from "@/hooks/use-invoice-list";

interface InvoiceActionsProps {
  invoice: Invoice;
  isAdmin: boolean | undefined;
  onView: (invoice: Invoice) => void;
  onModify: (invoice: Invoice) => void;
}

export const InvoiceActions = ({
  invoice,
  isAdmin,
  onView,
  onModify,
}: InvoiceActionsProps) => {
  const handleView = () => {
    onView(invoice);
  };

  const handleModify = () => {
    onModify(invoice);
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        size="icon"
        variant="ghost"
        onClick={handleView}
        title="Voir la facture"
      >
        <Eye className="h-4 w-4" />
      </Button>

      {isAdmin && (
        <Button
          size="icon"
          variant="ghost"
          onClick={handleModify}
          title="Modifier la facture"
        >
          <FileDown className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
