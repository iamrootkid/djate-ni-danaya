import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ExpenseType } from "@/types/expense";
import { useShopId } from "@/hooks/use-shop-id";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddExpenseDialog = ({ open, onOpenChange }: AddExpenseDialogProps) => {
  const [type, setType] = useState<ExpenseType>("salary");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const queryClient = useQueryClient();
  const { shopId } = useShopId();

  const { data: employees } = useQuery({
    queryKey: ["employees", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      console.log("Fetching employees for shop:", shopId);
      
      try {
        // First try staff table
        const { data: staffData, error: staffError } = await supabase
          .from("staff")
          .select(`
            id,
            email,
            first_name,
            last_name,
            role
          `)
          .eq("shop_id", shopId as any);

        console.log("Staff data:", staffData, "Error:", staffError);

        if (staffError) {
          console.error("Error fetching from staff:", staffError);
        }

        // If no staff data, try profiles
        if (!staffData || staffData.length === 0) {
          console.log("No staff data found, trying profiles...");
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select(`
              id,
              email,
              first_name,
              last_name,
              role
            `)
            .eq("shop_id", shopId as any)
            .not("role", "eq", "admin");

          console.log("Profile data:", profileData, "Error:", profileError);

          if (profileError) {
            console.error("Error fetching from profiles:", profileError);
            return [];
          }

          return profileData || [];
        }

        return staffData;
      } catch (error) {
        console.error("Error fetching employees:", error);
        return [];
      }
    },
    enabled: !!shopId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !amount || !shopId) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      // Create a properly typed expense object
      const expenseData = {
        amount: Number(amount),
        date: date.toISOString(),
        description,
        shop_id: shopId,
      } as any;

      // Add type and employee_id conditionally
      if (type) {
        expenseData.type = type;
      }
      
      if (["salary", "commission"].includes(type) && employeeId) {
        expenseData.employee_id = employeeId;
      }

      const { error } = await supabase.from("expenses").insert(expenseData);

      if (error) throw error;

      toast.success("Dépense ajoutée avec succès");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses-stats"] });
      onOpenChange(false);
      
      // Reset form
      setType("salary");
      setAmount("");
      setDate(new Date());
      setDescription("");
      setEmployeeId("");
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Erreur lors de l'ajout de la dépense");
    }
  };

  const typeLabels: Record<ExpenseType, string> = {
    salary: "Salaire",
    commission: "Commission",
    utility: "Facture",
    shop_maintenance: "Maintenance",
    stock_purchase: "Achat de stock",
    loan_shop: "Prêt boutique",
    other: "Autre",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter une dépense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type de dépense</Label>
            <Select value={type} onValueChange={(value) => setType(value as ExpenseType)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Montant</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Sélectionner une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => setDate(newDate || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {["salary", "commission"].includes(type) && (
            <div className="space-y-2">
              <Label htmlFor="employee">Employé</Label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un employé" />
                </SelectTrigger>
                <SelectContent>
                  {employees?.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnelle)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ajouter une description..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">Ajouter</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
