
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const SuperAdminLogin = () => {
  const [pinCode, setPinCode] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Super Admin PIN - set to 1280 for easy access
  const SUPER_ADMIN_PIN = "1280";

  const authenticateSuperAdmin = async () => {
    try {
      console.log('Authenticating super admin with PIN bypass...');
      
      // For now, use a simple local storage based authentication
      // This bypasses the Supabase email confirmation issues
      localStorage.setItem('superAdminAuth', 'true');
      localStorage.setItem('superAdminSession', JSON.stringify({
        user: {
          id: 'super-admin-local',
          email: 'superadmin@system.local',
          role: 'super_admin'
        },
        authenticated: true,
        timestamp: Date.now()
      }));
      
      console.log('Super admin authenticated successfully via PIN');
      return true;
    } catch (error) {
      console.error('Error authenticating super admin:', error);
      return false;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (pinCode === SUPER_ADMIN_PIN) {
        const success = await authenticateSuperAdmin();
        
        if (success) {
          toast.success("Accès Super Admin autorisé");
          navigate('/super-admin');
        } else {
          toast.error("Erreur lors de l'authentification Super Admin");
        }
      } else {
        toast.error("Code PIN incorrect");
        setPinCode("");
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md mx-4 shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-purple-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Super Administrateur
          </CardTitle>
          <p className="text-gray-600 text-sm">
            Entrez le code PIN pour accéder à l'interface d'administration
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="pin">Code PIN Super Admin</Label>
              <div className="relative">
                <Input
                  id="pin"
                  type={showPin ? "text" : "password"}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="Entrez votre code PIN"
                  className="text-center text-lg tracking-widest pr-10"
                  maxLength={6}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                  onClick={() => setShowPin(!showPin)}
                >
                  {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={loading || pinCode.length === 0}
            >
              {loading ? "Connexion..." : "Accéder au Dashboard"}
            </Button>
          </form>

          <div className="mt-6 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <p className="text-xs text-blue-800">
              <strong>Code PIN par défaut:</strong> 1280
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Accès administrateur système simplifié
            </p>
          </div>

          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              className="text-sm"
            >
              Retour à la connexion normale
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminLogin;
