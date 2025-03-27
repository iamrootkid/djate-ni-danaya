import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useShopId } from "@/hooks/use-shop-id";

interface StaffActionsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  employee: any;
}

export const StaffActions = ({ isOpen, onClose, onSave, employee }: StaffActionsProps) => {
  const [editFirstName, setEditFirstName] = useState(employee?.first_name || "");
  const [editLastName, setEditLastName] = useState(employee?.last_name || "");
  const [editEmail, setEditEmail] = useState(employee?.email || "");
  const [editPhone, setEditPhone] = useState(employee?.phone || "");
  const [password, setPassword] = useState("");
  const { shopId } = useShopId();

  const handleSave = () => {
    if (!shopId) {
      return;
    }

    onSave({
      first_name: editFirstName.trim(),
      last_name: editLastName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim() || null,
      password: password || undefined,
      shop_id: shopId
    });
    setPassword("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier l'employé</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium mb-1">
              Prénom
            </label>
            <Input
              id="firstName"
              value={editFirstName}
              onChange={(e) => setEditFirstName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium mb-1">
              Nom
            </label>
            <Input
              id="lastName"
              value={editLastName}
              onChange={(e) => setEditLastName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              Téléphone
            </label>
            <Input
              id="phone"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              placeholder="Optionnel"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Mot de passe
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Laissez vide pour garder le mot de passe actuel"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleSave}>Enregistrer</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};