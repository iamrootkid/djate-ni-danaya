import { AppLayout } from "@/components/Layout/AppLayout";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays } from "date-fns";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { DateRange } from "react-day-picker";
import { SalesReport } from "@/components/Reports/SalesReport";
import { PerformanceReport } from "@/components/Reports/PerformanceReport";
import { SalesSummary } from "@/components/Reports/SalesSummary";
import { useSalesReport } from "@/hooks/use-sales-report";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryReport } from "@/components/Reports/InventoryReport";
import { FinancialReport } from "@/components/Reports/FinancialReport";
import { FileBarChart2, Download } from "lucide-react";
import { useShopId } from "@/hooks/use-shop-id";
import { useQueryClient } from "@tanstack/react-query";

type ExportData = {
  [key: string]: string | number;
};

const Reports = () => {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [reportType, setReportType] = useState("sales");
  const [activeTab, setActiveTab] = useState("sales");
  const { data: salesData } = useSalesReport(dateRange);
  const { shopId } = useShopId();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!shopId) return;

    // Set up real-time listeners for various tables
    const channels = [
      supabase
        .channel('sales-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'sales', filter: `shop_id=eq.${shopId}` },
          () => {
            queryClient.invalidateQueries({ queryKey: ['sales-report'] });
            queryClient.invalidateQueries({ queryKey: ['best-selling-products'] });
          }
        )
        .subscribe(),

      supabase
        .channel('expenses-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'expenses', filter: `shop_id=eq.${shopId}` },
          () => {
            queryClient.invalidateQueries({ queryKey: ['financial-report'] });
          }
        )
        .subscribe(),

      supabase
        .channel('products-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products', filter: `shop_id=eq.${shopId}` },
          () => {
            queryClient.invalidateQueries({ queryKey: ['inventory-report'] });
          }
        )
        .subscribe(),

      supabase
        .channel('staff-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'staff', filter: `shop_id=eq.${shopId}` },
          () => {
            queryClient.invalidateQueries({ queryKey: ['staff-performance'] });
          }
        )
        .subscribe(),
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [queryClient, shopId]);

  const handleExportData = async () => {
    try {
      if (!dateRange.from || !dateRange.to || !shopId) {
        toast({
          title: "Plage de dates requise",
          description: "Veuillez sélectionner une plage de dates valide avant d'exporter.",
          variant: "destructive",
        });
        return;
      }

      let dataToExport: ExportData[] = [];
      
      if (reportType === "sales") {
        dataToExport = salesData?.map(sale => ({
          date: new Date(sale.created_at).toLocaleDateString(),
          montant: sale.total_amount,
          employé: sale.employee?.email || 'Non assigné',
        })) || [];
      } else if (reportType === "performance") {
        const { data: staffData } = await supabase
          .from("staff")
          .select("first_name, last_name, email, role")
          .eq("shop_id", shopId);
        
        dataToExport = staffData?.map(staff => ({
          employé: `${staff.first_name} ${staff.last_name}`,
          email: staff.email,
          rôle: staff.role,
          date_rapport: new Date().toLocaleDateString(),
        })) || [];
      } else if (reportType === "inventory") {
        const { data: inventory } = await supabase
          .from("products")
          .select(`
            name,
            stock,
            price,
            categories(name)
          `)
          .eq("shop_id", shopId);
        
        dataToExport = inventory?.map(product => ({
          produit: product.name,
          catégorie: product.categories?.name || 'Non catégorisé',
          stock: product.stock,
          prix: product.price,
        })) || [];
      } else if (reportType === "financial") {
        const { data: sales } = await supabase
          .from("sales")
          .select("created_at, total_amount")
          .eq("shop_id", shopId)
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString());
          
        const { data: expenses } = await supabase
          .from("expenses")
          .select("date, amount, type, description")
          .eq("shop_id", shopId)
          .gte('date', dateRange.from.toISOString())
          .lte('date', dateRange.to.toISOString());
          
        dataToExport = [
          ...(sales || []).map(sale => ({
            date: new Date(sale.created_at).toLocaleDateString(),
            type: "Vente",
            montant: sale.total_amount,
            description: "Vente"
          })),
          ...(expenses || []).map(expense => ({
            date: new Date(expense.date).toLocaleDateString(),
            type: "Dépense",
            montant: -expense.amount,
            description: expense.description
          }))
        ];
      }

      if (!dataToExport?.length) {
        toast({
          title: "Aucune donnée",
          description: "Il n'y a pas de données à exporter pour la période sélectionnée.",
          variant: "destructive",
        });
        return;
      }

      const csvContent = "data:text/csv;charset=utf-8," + 
        Object.keys(dataToExport[0]).join(",") + "\n" +
        dataToExport.map(row => Object.values(row).join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${reportType}_report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export réussi",
        description: "Votre rapport a été exporté avec succès.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Échec de l'export",
        description: "Une erreur s'est produite lors de l'exportation de votre rapport.",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileBarChart2 className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold tracking-tight">Rapports</h2>
          </div>
          <div className="flex gap-4">
            <Select value={reportType} onValueChange={(value) => {
              setReportType(value);
              setActiveTab(value);
            }}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Sélectionner le type de rapport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Rapport des ventes</SelectItem>
                <SelectItem value="performance">Performance du personnel</SelectItem>
                <SelectItem value="inventory">État des stocks</SelectItem>
                <SelectItem value="financial">Rapport financier</SelectItem>
              </SelectContent>
            </Select>
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            <Button onClick={handleExportData} className="flex gap-2">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="sales">Ventes</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="inventory">Inventaire</TabsTrigger>
            <TabsTrigger value="financial">Financier</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sales" className="space-y-6 mt-6">
            <SalesReport dateRange={dateRange} />
            <SalesSummary dateRange={dateRange} />
          </TabsContent>
          
          <TabsContent value="performance" className="mt-6">
            <PerformanceReport />
          </TabsContent>
          
          <TabsContent value="inventory" className="mt-6">
            <InventoryReport />
          </TabsContent>
          
          <TabsContent value="financial" className="mt-6">
            <FinancialReport dateRange={dateRange} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Reports;
