
import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Phone } from "lucide-react";
import { InvoiceData } from "@/types/invoice"; 

export interface InvoiceTableRowProps {
  invoice: InvoiceData;
}

export const InvoiceTableRow = ({ invoice }: InvoiceTableRowProps) => {
  // Format date to French locale
  const date = new Date(invoice.created_at);
  const formattedDate = format(date, "d MMMM yyyy", { locale: fr });
  const formattedTime = format(date, "HH:mm", { locale: fr });

  // Format amount to French locale with F CFA
  const formattedAmount = new Intl.NumberFormat("fr-FR").format(invoice.total_amount || 0) + " F CFA";

  return (
    <TableRow>
      <TableCell>{invoice.invoice_number}</TableCell>
      <TableCell>
        <div>
          <div>{invoice.customer_name || "Client inconnu"}</div>
          {invoice.customer_phone ? (
            <div className="flex items-center text-xs text-muted-foreground mt-1 gap-1">
              <Phone className="h-3 w-3" />
              <span>{invoice.customer_phone}</span>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground mt-1">
              Numéro inconnu
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>{invoice.employee_email || "Utilisateur inconnu"}</TableCell>
      <TableCell>{formattedDate}</TableCell>
      <TableCell>{formattedTime}</TableCell>
      <TableCell className="text-right">{formattedAmount}</TableCell>
    </TableRow>
  );
};
