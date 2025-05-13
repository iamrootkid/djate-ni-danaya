
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
  return (
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
};
