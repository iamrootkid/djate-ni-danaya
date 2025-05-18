
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { AddCustomerDialog } from "./AddCustomerDialog";
import { EditCustomerDialog } from "./EditCustomerDialog";
import { getCustomers, deleteCustomer } from "./utils/customerOperations";
import type { Customer } from "@/types/customer";

interface CustomerListProps {
  shopId: string;
}

export const CustomerList: React.FC<CustomerListProps> = ({ shopId }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCustomers(shopId);
      setCustomers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [shopId]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Clients</CardTitle>
          <Button onClick={() => setAddOpen(true)}>Nouveau client</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Loyalty Points</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5}>Chargement...</TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Aucun client trouvé
                </TableCell>
              </TableRow>
            ) : (
              customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    {c.first_name || ""} {c.last_name || ""}
                  </TableCell>
                  <TableCell>{c.email || "-"}</TableCell>
                  <TableCell>{c.phone || "-"}</TableCell>
                  <TableCell>{c.loyalty_points}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditCustomer(c)}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        await deleteCustomer(c.id);
                        fetchCustomers();
                      }}
                      className="ml-2"
                    >
                      Supprimer
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      <AddCustomerDialog
        shopId={shopId}
        open={addOpen}
        onOpenChange={(isOpen) => {
          setAddOpen(isOpen);
          if (!isOpen) fetchCustomers();
        }}
      />
      {editCustomer && (
        <EditCustomerDialog
          initialCustomer={editCustomer}
          onClose={() => {
            setEditCustomer(null);
            fetchCustomers();
          }}
        />
      )}
    </Card>
  );
};
