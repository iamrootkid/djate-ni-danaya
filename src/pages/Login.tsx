
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleSelection } from "@/components/auth/RoleSelection";
import { LoginForm } from "@/components/auth/LoginForm";
import { PasswordResetForm } from "@/components/auth/PasswordResetForm";
import { ShopIdVerification } from "@/components/auth/ShopIdVerification";
import { Button } from "@/components/ui/button";
import { createPredefinedUsers } from "@/utils/createPredefinedUsers";
import { toast } from "sonner";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'employee' | null>(null);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [shopId, setShopId] = useState<string | null>(null);
  const [showShopIdForm, setShowShopIdForm] = useState(true);
  const [creatingUsers, setCreatingUsers] = useState(false);

  const handleRoleSelect = (role: 'admin' | 'employee') => {
    setSelectedRole(role);
    setShowForm(true);
  };

  const handleShopIdVerify = (verified: boolean, verifiedShopId: string) => {
    if (verified) {
      setShopId(verifiedShopId);
      setShowShopIdForm(false);
    }
  };

  const handleCreateUsers = async () => {
    setCreatingUsers(true);
    try {
      const users = await createPredefinedUsers();
      toast.success(`Created admin (${users.admin.email}) and employee (${users.employee.email}) users`, {
        description: "You can now login with these credentials",
        duration: 10000,
      });
    } catch (error) {
      console.error("Failed to create users:", error);
    } finally {
      setCreatingUsers(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md mx-4 shadow-custom hover:shadow-lg transition-shadow duration-200 mb-4">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center text-gray-900">
            Système de Gestion de Magasin
          </CardTitle>
          {shopId ? (
            <p className="text-center text-gray-500">
              {showForm ? `Connexion en tant que ${selectedRole === 'admin' ? 'Administrateur' : 'Employé'}` : 'Choisissez votre rôle pour continuer'}
            </p>
          ) : (
            <p className="text-center text-gray-500">
              Veuillez entrer l'identifiant de votre magasin
            </p>
          )}
        </CardHeader>
        <CardContent>
          {showShopIdForm ? (
            <ShopIdVerification 
              onVerified={handleShopIdVerify} 
              loading={loading} 
              setLoading={setLoading}
            />
          ) : !showForm ? (
            <RoleSelection
              onRoleSelect={handleRoleSelect}
              loading={loading}
            />
          ) : showResetPassword ? (
            <PasswordResetForm
              onBack={() => setShowResetPassword(false)}
            />
          ) : (
            <LoginForm
              selectedRole={selectedRole!}
              shopId={shopId!}
              onBack={() => {
                setShowForm(false);
                setSelectedRole(null);
              }}
              onForgotPassword={() => setShowResetPassword(true)}
            />
          )}
        </CardContent>
      </Card>
      
      <div className="mt-4 text-center">
        <Button 
          variant="outline" 
          onClick={handleCreateUsers}
          disabled={creatingUsers}
          className="hover:bg-gray-100"
        >
          {creatingUsers ? "Creating Users..." : "Create Demo Users"}
        </Button>
        {!creatingUsers && (
          <p className="text-xs text-gray-500 mt-2">
            This will create an admin and employee account for testing
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
