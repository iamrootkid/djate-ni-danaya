import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleSelection } from "@/components/auth/RoleSelection";
import { LoginForm } from "@/components/auth/LoginForm";
import { PasswordResetForm } from "@/components/auth/PasswordResetForm";
import { ShopIdVerification } from "@/components/auth/ShopIdVerification";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentUserRole } from "@/utils/roleUtils";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'employee' | null>(null);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [shopId, setShopId] = useState<string | null>(null);
  const [showShopIdForm, setShowShopIdForm] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

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
    </div>
  );
};

export default Login;
