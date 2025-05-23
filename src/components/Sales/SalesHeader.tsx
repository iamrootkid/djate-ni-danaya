import { Button } from "@/components/ui/button";
import { ShoppingCart, Clock, History } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserProfile } from "@/components/Dashboard/UserProfile";
import { Badge } from "@/components/ui/badge";

interface SalesHeaderProps {
  cartTotal: number;
  cartEmpty: boolean;
  isPending: boolean;
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  onCheckout: () => void;
}

export const SalesHeader = ({
  cartTotal,
  cartEmpty,
  isPending,
  paymentMethod,
  setPaymentMethod,
  onCheckout,
}: SalesHeaderProps) => {
  const currentTime = new Date().toLocaleTimeString();
  const currentDate = new Date().toLocaleDateString();

  return (
    <div className="space-y-6">
      <div className="bg-[#1A1F2C] text-white py-3 md:py-4">
        <div className="container mx-auto px-2 md:px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 md:gap-4">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-10 w-10 md:h-16 md:w-16 object-contain"
              />
              <h1 className="text-xl md:text-3xl font-bold tracking-wider">DJATE NI DANAYA</h1>
            </div>
            <div className="flex items-center gap-4 md:gap-6">
              <div className="hidden md:flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{currentTime}</span>
                </div>
                <div className="text-sm text-gray-300">{currentDate}</div>
              </div>
              <UserProfile />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 md:px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
          <div className="flex flex-col gap-1 md:gap-2">
            <h2 className="text-xl md:text-3xl font-bold tracking-tight">Ventes</h2>
            <div className="flex gap-1 md:gap-2">
              <Badge variant="outline" className="bg-primary/10">
                <History className="mr-1 h-3 w-3" />
                Ventes du jour
              </Badge>
              <Badge variant="outline" className="bg-success/10">
                Session active
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="w-[140px] md:w-[180px]">
                <SelectValue placeholder="Sélectionner le mode de paiement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Espèces</SelectItem>
                <SelectItem value="online">Paiement en ligne</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-base md:text-lg font-semibold">
              Total: {cartTotal.toLocaleString()} F CFA
            </span>
            <Button
              onClick={onCheckout}
              disabled={cartEmpty || isPending}
              className="bg-primary hover:bg-primary-dark"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {isPending ? "Traitement..." : "Payer"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};