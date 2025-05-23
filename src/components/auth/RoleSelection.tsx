import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

interface RoleSelectionProps {
  onRoleSelect: (role: 'admin' | 'employee') => void;
  loading: boolean;
}

export const RoleSelection = ({ onRoleSelect, loading }: RoleSelectionProps) => {
  return (
    <div className="space-y-2 md:space-y-4 px-1 md:px-0">
      <Button
        className="w-full bg-primary hover:bg-primary-dark text-white transition-colors text-sm md:text-lg py-1 md:py-3"
        size="lg"
        onClick={() => onRoleSelect('admin')}
        disabled={loading}
      >
        <User className="mr-2 h-4 w-4 md:h-5 md:w-5" />
        Connexion en tant qu'Administrateur
      </Button>
      <Button
        className="w-full border-2 border-primary text-primary hover:bg-primary-light transition-colors text-sm md:text-lg py-1 md:py-3"
        variant="outline"
        size="lg"
        onClick={() => onRoleSelect('employee')}
        disabled={loading}
      >
        <User className="mr-2 h-4 w-4 md:h-5 md:w-5" />
        Connexion en tant qu'Employé
      </Button>
    </div>
  );
};