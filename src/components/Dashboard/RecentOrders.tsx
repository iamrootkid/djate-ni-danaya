import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from "@/types/order";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RecentOrdersProps {
  orders?: Order[];
  className?: string;
}

export const RecentOrders = ({ orders, className }: RecentOrdersProps) => {
  // Mobile view content
  const MobileContent = () => (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h3 className="text-xl font-bold text-[#222] mb-2">Factures d'aujourd'hui</h3>
      {!orders || orders.length === 0 ? (
        <p className="text-[#e53935] text-base mt-1">Erreur lors du chargement des factures</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order, index) => (
            <div
              key={order.id}
              className={cn(
                "flex flex-col space-y-1",
                index !== orders.length - 1 && "border-b border-[#e0e0e0] pb-3"
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#222]">{order.customer_name}</p>
                <Badge className={cn(
                  order.status === "pending" ? "bg-yellow-500 hover:bg-yellow-600" :
                  order.status === "cancelled" ? "bg-destructive hover:bg-destructive/80" :
                  "bg-green-500 hover:bg-green-600"
                )}>
                  {order.status === "pending"
                    ? "En attente"
                    : order.status === "cancelled"
                    ? "Annulé"
                    : "Complété"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-[#888]">
                <p>
                  {format(new Date(order.created_at), "d MMM yyyy, HH:mm", {
                    locale: fr,
                  })}
                </p>
                <p>{order.total_amount.toLocaleString()} F CFA</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Desktop view content
  const DesktopContent = () => (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Commandes récentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!orders || orders.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Aucune commande récente</p>
          ) : (
            orders.map((order, index) => (
              <div
                key={order.id}
                className={cn(
                  "flex flex-col space-y-1 pb-2",
                  index !== orders.length - 1 && "border-b border-muted"
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium leading-none">{order.customer_name}</p>
                  <Badge className={cn(
                    order.status === "pending" ? "bg-yellow-500 hover:bg-yellow-600" :
                    order.status === "cancelled" ? "bg-destructive hover:bg-destructive/80" :
                    "bg-green-500 hover:bg-green-600"
                  )}>
                    {order.status === "pending"
                      ? "En attente"
                      : order.status === "cancelled"
                      ? "Annulé"
                      : "Complété"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <p>
                    {format(new Date(order.created_at), "d MMM yyyy, HH:mm", {
                      locale: fr,
                    })}
                  </p>
                  <p>{order.total_amount.toLocaleString()} F CFA</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="md:hidden">
        <MobileContent />
      </div>
      <div className="hidden md:block">
        <DesktopContent />
      </div>
    </>
  );
};
