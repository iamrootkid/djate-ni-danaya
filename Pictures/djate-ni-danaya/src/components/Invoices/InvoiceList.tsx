import { useInvoiceList } from "@/hooks/use-invoice-list";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InvoiceViewDialog } from "./InvoiceViewDialog";
import { InvoiceModifyDialog } from "./InvoiceModifyDialog";
import { InvoiceRow } from "./InvoiceRow";
import { InvoiceLoadingState } from "./InvoiceLoadingState";
import { InvoiceEmptyState } from "./InvoiceEmptyState";

interface InvoiceListProps {
  dateFilter: "all" | "daily" | "monthly";
  startDate: Date | null;
  endDate: Date | null;
}

export const InvoiceList = ({ dateFilter, startDate, endDate }: InvoiceListProps) => {
  const {
    invoices,
    isLoading,
    refetch,
    isAdmin,
    selectedInvoice,
    setSelectedInvoice,
    modifyingInvoice,
    setModifyingInvoice,
    prepareInvoiceData
  } = useInvoiceList({ dateFilter, startDate, endDate });

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numero de facture</TableHead>
                <TableHead>Nom Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <InvoiceLoadingState />
              ) : invoices && invoices.length > 0 ? (
                invoices.map(invoice => (
                  <InvoiceRow
                    key={invoice.id}
                    invoice={{
                      ...invoice,
                      is_modified: invoice.is_modified ?? false // Ensure present
                    }}
                    isAdmin={isAdmin}
                    onView={setSelectedInvoice}
                    onModify={setModifyingInvoice}
                  />
                ))
              ) : (
                <InvoiceEmptyState />
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedInvoice && (
        <InvoiceViewDialog
          open={!!selectedInvoice}
          onOpenChange={(open) => !open && setSelectedInvoice(null)}
          invoice={prepareInvoiceData(selectedInvoice)}
          refreshInvoices={refetch}
        />
      )}

      {modifyingInvoice && (
        <InvoiceModifyDialog
          open={!!modifyingInvoice}
          onClose={() => setModifyingInvoice(null)}
          invoice={modifyingInvoice}
          onModified={() => {
            refetch();
            setModifyingInvoice(null);
          }}
        />
      )}
    </div>
  );
};
