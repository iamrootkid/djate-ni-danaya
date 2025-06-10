import { AppLayout } from "@/components/Layout/AppLayout";
import { StoreSettingsForm } from "@/components/Settings/StoreSettingsForm";
import { EmployeeList } from "@/components/Settings/EmployeeList";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";

const Settings = () => {
  const isMobile = useIsMobile();
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
        <div className={isMobile ? "grid grid-cols-1 gap-6" : "grid grid-cols-1 md:grid-cols-2 gap-6"}>
          <Card className="bg-white dark:bg-[#18181b] rounded-xl shadow-sm w-full">
            <CardContent className="p-4">
              <StoreSettingsForm />
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-[#18181b] rounded-xl shadow-sm w-full">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold tracking-tight">Employés</h3>
                </div>
                <EmployeeList />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
