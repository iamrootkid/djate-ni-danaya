
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateCustomer } from "./utils/customerOperations";
import type { Customer } from "@/types/customer";

interface Props {
  initialCustomer: Customer;
  onClose: () => void;
}

export const EditCustomerDialog: React.FC<Props> = ({ initialCustomer, onClose }) => {
  const [form, setForm] = useState({
    first_name: initialCustomer.first_name ?? "",
    last_name: initialCustomer.last_name ?? "",
    email: initialCustomer.email ?? "",
    phone: initialCustomer.phone ?? "",
  });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await updateCustomer(initialCustomer.id, form);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier client</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <Input
            placeholder="Prénom"
            value={form.first_name}
            onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
          />
          <Input
            placeholder="Nom"
            value={form.last_name}
            onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
          />
          <Input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <Input
            placeholder="Téléphone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>
        <Button onClick={handleUpdate} disabled={loading} className="mt-4 w-full">
          Mettre à jour
        </Button>
      </DialogContent>
    </Dialog>
  );
};
