
import { TableRow, TableCell } from "@/components/ui/table";
import { format } from "date-fns";
import { CustomerInfo } from "./CustomerInfo";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { InvoiceAmount } from "./InvoiceAmount";
import { InvoiceActions } from "./InvoiceActions";
import { Invoice } from "@/hooks/use-invoice-list";

interface InvoiceRowProps {
  invoice: Invoice;
  isAdmin: boolean | undefined;
  onView: (invoice: Invoice) => void;
  onModify: (invoice: Invoice) => void;
}

export const InvoiceRow = ({ invoice, isAdmin, onView, onModify }: InvoiceRowProps) => {
  // Safely extract the total amount, ensuring we have a valid number
  const originalAmount = invoice.sales?.total_amount || 0;
  
  return (
    <TableRow key={invoice.id}>
      <TableCell className="font-medium">
        {invoice.invoice_number}
        {invoice.is_modified && (
          <span className="ml-2">
            <InvoiceStatusBadge
              isModified={true}
              modificationReason={invoice.modification_reason}
            />
          </span>
        )}
      </TableCell>
      <TableCell>
        <CustomerInfo name={invoice.customer_name} phone={invoice.customer_phone} />
      </TableCell>
      <TableCell>
        {format(new Date(invoice.created_at), "MMM d, yyyy HH:mm")}
      </TableCell>
      <TableCell className="text-right">
        <InvoiceAmount
          originalAmount={originalAmount}
          newAmount={invoice.new_total_amount}
          isModified={!!invoice.is_modified}
        />
      </TableCell>
      <TableCell className="text-right">
        <InvoiceStatusBadge
          isModified={!!invoice.is_modified}
          modificationReason={invoice.modification_reason}
        />
      </TableCell>
      <TableCell className="text-right">
        <InvoiceActions
          invoice={invoice}
          isAdmin={isAdmin}
          onView={onView}
          onModify={onModify}
        />
      </TableCell>
    </TableRow>
  );
};
