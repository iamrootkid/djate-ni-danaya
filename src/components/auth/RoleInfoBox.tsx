
interface RoleInfoBoxProps {
  selectedRole: 'admin' | 'employee';
}

export const RoleInfoBox = ({ selectedRole }: RoleInfoBoxProps) => {
  return (
    <div className="p-3 bg-muted rounded-lg">
      <p className="text-sm text-center text-muted-foreground">
        Vous vous connectez en tant que <strong>{selectedRole === 'admin' ? 'Administrateur' : 'Employé'}</strong>. 
        {selectedRole === 'admin' 
          ? " Si vous êtes employé, veuillez utiliser la section Employé."
          : " Si vous êtes administrateur, veuillez utiliser la section Administrateur."
        }
      </p>
    </div>
  );
};
