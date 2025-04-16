
import { AppLayout } from "@/components/Layout/AppLayout";
import { StoreSettingsForm } from "@/components/Settings/StoreSettingsForm";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Paramètres</h2>
          <p className="text-muted-foreground">
            Gérez les paramètres de votre magasin.
          </p>
        </div>
        
        <Separator />
        
        <div className="space-y-8">
          <StoreSettingsForm />
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
