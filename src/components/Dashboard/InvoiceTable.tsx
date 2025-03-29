
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InvoiceTableRow } from "./InvoiceTableRow";
import { InvoiceTableSkeleton } from "./InvoiceTableSkeleton";
import { InvoiceData } from "@/types/invoice";

interface InvoiceTableProps {
  invoices: InvoiceData[] | undefined;
  isLoading: boolean;
}

export const InvoiceTable = ({ invoices, isLoading }: InvoiceTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Numéro de facture</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Employé</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Heure</TableHead>
          <TableHead className="text-right">Montant</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <InvoiceTableSkeleton />
        ) : (
          invoices && invoices.length > 0 ? (
            invoices.map((invoice) => (
              <InvoiceTableRow key={invoice.id} invoice={invoice} />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                Aucune facture trouvée pour la période sélectionnée.
              </TableCell>
            </TableRow>
          )
        )}
      </TableBody>
    </Table>
  );
};
