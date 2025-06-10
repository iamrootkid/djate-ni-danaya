
import { TableRow, TableCell } from "@/components/ui/table";

export const InvoiceEmptyState = () => {
  return (
    <TableRow>
      <TableCell colSpan={6} className="text-center py-8">
        No invoices found for the selected date range.
      </TableCell>
    </TableRow>
  );
};
