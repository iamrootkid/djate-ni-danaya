
import { TableRow, TableCell } from "@/components/ui/table";

export const InvoiceLoadingState = () => {
  return (
    <TableRow>
      <TableCell colSpan={6} className="text-center py-8">
        Loading invoices...
      </TableCell>
    </TableRow>
  );
};
