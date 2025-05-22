import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/utils/date-formatters";
import { formatCurrency } from "@/utils/currency";
import { DashboardInvoiceData } from "./DashboardInvoices";

interface InvoiceTableProps {
  invoices?: DashboardInvoiceData[];
  isLoading: boolean;
}

export function InvoiceTable({ invoices, isLoading }: InvoiceTableProps) {
  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-foreground">N° Facture</TableHead>
            <TableHead className="text-foreground">Client</TableHead>
            <TableHead className="text-foreground">Date</TableHead>
            <TableHead className="text-right text-foreground">Montant</TableHead>
            <TableHead className="text-right text-foreground">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array(5)
              .fill(0)
              .map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-5 w-16 ml-auto" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-5 w-16 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
          ) : invoices && invoices.length > 0 ? (
            invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="text-foreground">{invoice.invoice_number}</TableCell>
                <TableCell className="text-foreground">{invoice.customer_name}</TableCell>
                <TableCell className="text-foreground">{formatDate(invoice.created_at)}</TableCell>
                <TableCell className="text-right text-foreground">
                  {formatCurrency(invoice.total_amount || 0)}
                </TableCell>
                <TableCell className="text-right">
                  {invoice.is_modified ? (
                    <Badge variant="warning">
                      Modifiée
                    </Badge>
                  ) : (
                    <Badge variant="success">
                      Complète
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                Aucune facture trouvée
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
