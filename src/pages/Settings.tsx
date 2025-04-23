
import { AppLayout } from "@/components/Layout/AppLayout";
import { StoreSettingsForm } from "@/components/Settings/StoreSettingsForm";
import { EmployeeList } from "@/components/Settings/EmployeeList";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Paramètres</h2>
          <p className="text-muted-foreground">
            Gérez les paramètres de votre magasin et les informations des employés.
          </p>
        </div>
        
        <Separator />
        
        <div className="space-y-8">
          <StoreSettingsForm />
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-semibold tracking-tight">Employés</h3>
            </div>
            <EmployeeList />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
