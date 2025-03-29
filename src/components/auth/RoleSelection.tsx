import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

interface RoleSelectionProps {
  onRoleSelect: (role: 'admin' | 'employee') => void;
  loading: boolean;
}

export const RoleSelection = ({ onRoleSelect, loading }: RoleSelectionProps) => {
  return (
    <div className="space-y-4">
      <Button
        className="w-full bg-primary hover:bg-primary-dark text-white transition-colors"
        size="lg"
        onClick={() => onRoleSelect('admin')}
        disabled={loading}
      >
        <User className="mr-2 h-4 w-4" />
        Connexion en tant qu'Administrateur
      </Button>
      <Button
        className="w-full border-2 border-primary text-primary hover:bg-primary-light transition-colors"
        variant="outline"
        size="lg"
        onClick={() => onRoleSelect('employee')}
        disabled={loading}
      >
        <User className="mr-2 h-4 w-4" />
        Connexion en tant qu'Employé
      </Button>
    </div>
  );
};