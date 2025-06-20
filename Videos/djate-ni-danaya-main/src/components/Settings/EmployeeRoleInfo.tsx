
interface EmployeeRoleInfoProps {
  role: string;
}

export const EmployeeRoleInfo = ({ role }: EmployeeRoleInfoProps) => {
  if (!role) return null;
  
  return (
    <p className="mt-2 text-sm text-muted-foreground">
      {role === "admin" 
        ? "Les administrateurs ont accès au tableau de bord et à toutes les fonctionnalités de gestion."
        : "Les employés ont accès uniquement au module de vente."}
    </p>
  );
};
