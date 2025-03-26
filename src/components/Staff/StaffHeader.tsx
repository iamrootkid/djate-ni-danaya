import { AddEmployeeForm } from "@/components/Settings/AddEmployeeForm";

interface StaffHeaderProps {
  onSuccess: () => void;
}

export const StaffHeader = ({ onSuccess }: StaffHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-3xl font-bold tracking-tight">Staff Management</h2>
      <AddEmployeeForm onSuccess={onSuccess} />
    </div>
  );
};