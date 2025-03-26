import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InvoiceTableRow } from "./InvoiceTableRow";
import { InvoiceTableSkeleton } from "./InvoiceTableSkeleton";
import { InvoiceData } from "@/hooks/use-dashboard-invoices";

interface InvoiceTableProps {
  invoices: InvoiceData[] | undefined;
  isLoading: boolean;
}

export const InvoiceTable = ({ invoices, isLoading }: InvoiceTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>N° Facture</TableHead>
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
          invoices?.length ? (
            invoices.map((invoice) => (
              <InvoiceTableRow key={invoice.id} invoice={invoice} />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                Aucune facture récente trouvée
              </TableCell>
            </TableRow>
          )
        )}
      </TableBody>
    </Table>
  );
};
