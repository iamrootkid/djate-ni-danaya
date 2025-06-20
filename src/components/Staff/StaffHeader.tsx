import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { EmployeeFormFields } from "@/components/Settings/EmployeeFormFields";
import { useAddEmployee } from "@/hooks/use-add-employee";

interface StaffHeaderProps {
  onSuccess: () => void;
}

export const StaffHeader = ({ onSuccess }: StaffHeaderProps) => {
  const {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    phone,
    setPhone,
    role,
    setRole,
    password,
    setPassword,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    handleSubmit
  } = useAddEmployee(onSuccess);

  return (
    <div className="flex justify-between items-center">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Ajouter un employé
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un nouvel employé</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <EmployeeFormFields
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              email={email}
              setEmail={setEmail}
              phone={phone}
              setPhone={setPhone}
              role={role}
              setRole={setRole}
              password={password}
              setPassword={setPassword}
              isLoading={isLoading}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Ajout en cours..." : "Ajouter l'employé"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
