
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export const AccessDeniedAlert = () => {
  return (
    <div className="flex items-center justify-center h-full mt-20">
      <Alert className="max-w-md">
        <AlertTitle>Accès restreint</AlertTitle>
        <AlertDescription>
          Cette page est réservée aux employés. Vous êtes un administrateur et vous serez redirigé vers le tableau de bord.
        </AlertDescription>
      </Alert>
    </div>
  );
};
