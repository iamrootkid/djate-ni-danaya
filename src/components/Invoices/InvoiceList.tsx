import { useInvoiceList } from "@/hooks/use-invoice-list";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InvoiceViewDialog } from "./InvoiceViewDialog";
import { InvoiceModifyDialog } from "./InvoiceModifyDialog";
import { InvoiceRow } from "./InvoiceRow";
import { InvoiceLoadingState } from "./InvoiceLoadingState";
import { InvoiceEmptyState } from "./InvoiceEmptyState";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, FileDown } from "lucide-react";
import { format } from "date-fns";

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
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          {isMobile ? (
            <div className="py-2">
              {isLoading ? (
                <InvoiceLoadingState />
              ) : invoices && invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="bg-white dark:bg-[#18181b] rounded-xl mb-4 p-4 border border-border shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-lg font-bold text-foreground">
                        {invoice.invoice_number}
                      </div>
                      <div className="flex gap-2 bg-[#f6f7fa] dark:bg-gray-800 rounded-xl p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedInvoice({ ...invoice, is_modified: invoice.is_modified ?? false, sale_id: invoice.sale_id ?? "" } as any)}
                          className="hover:bg-[#ececec] dark:hover:bg-gray-700"
                          aria-label="Voir la facture"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setModifyingInvoice({ ...invoice, is_modified: invoice.is_modified ?? false, sale_id: invoice.sale_id ?? "" } as any)}
                            className="hover:bg-[#ececec] dark:hover:bg-gray-700"
                            aria-label="Modifier la facture"
                          >
                            <FileDown className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground min-w-[70px]">Client:</span>
                        <span className="text-sm text-foreground break-all">{invoice.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground min-w-[70px]">Date:</span>
                        <span className="text-sm text-foreground">{format(new Date(invoice.created_at), "d MMM yyyy, HH:mm")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground min-w-[70px]">Montant:</span>
                        <span className="text-sm text-foreground font-semibold">{(invoice.total_amount || 0).toLocaleString()} F CFA</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground min-w-[70px]">Status:</span>
                        <Badge className={invoice.is_modified ? "bg-yellow-500 text-white" : "bg-[#22c55e] text-white"}>
                          {invoice.is_modified ? "Modifiée" : "Complète"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <InvoiceEmptyState />
              )}
            </div>
          ) : (
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
                        is_modified: invoice.is_modified ?? false,
                        sale_id: invoice.sale_id ?? ""
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
          )}
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
