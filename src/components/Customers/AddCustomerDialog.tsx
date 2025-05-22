
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addCustomer } from "./utils/customerOperations";
import type { Customer } from "@/types/customer";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopId: string;
}

export const AddCustomerDialog: React.FC<Props> = ({ open, onOpenChange, shopId }) => {
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await addCustomer({ ...form, shop_id: shopId, loyalty_points: 0 });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau client</DialogTitle>
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
        <Button onClick={handleCreate} disabled={loading} className="mt-4 w-full">
          Ajouter
        </Button>
      </DialogContent>
    </Dialog>
  );
};
