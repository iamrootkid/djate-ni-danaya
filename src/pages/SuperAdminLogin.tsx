
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

  // Default Super Admin PIN - in production this should be configurable
  const SUPER_ADMIN_PIN = "123456";

  const createSuperAdminUser = async () => {
    try {
      console.log('Attempting to create/sign in super admin...');
      
      // Try to sign in with existing credentials first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'superadmin@system.local',
        password: 'SuperAdmin123!@#'
      });

      if (!signInError && signInData.user) {
        console.log('Super admin signed in successfully');
        
        // Update profile to ensure super admin role
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: signInData.user.id,
            email: 'superadmin@system.local',
            first_name: 'Super',
            last_name: 'Admin',
            role: 'super_admin'
          });

        if (profileError) {
          console.error('Profile error:', profileError);
        }
        
        return true;
      }

      // If sign in failed, try to create the account
      console.log('Creating new super admin account...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'superadmin@system.local',
        password: 'SuperAdmin123!@#',
        options: {
          data: {
            first_name: 'Super',
            last_name: 'Admin',
            role: 'super_admin'
          }
        }
      });

      if (authError) {
        console.error('Auth creation error:', authError);
        throw authError;
      }

      if (authData.user) {
        // Update profile with super admin role
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: 'superadmin@system.local',
            first_name: 'Super',
            last_name: 'Admin',
            role: 'super_admin'
          });

        if (profileError) {
          console.error('Profile error:', profileError);
        }
      }

      return true;
    } catch (error) {
      console.error('Error creating/signing in super admin:', error);
      return false;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (pinCode === SUPER_ADMIN_PIN) {
        // Create or sign in super admin user
        const success = await createSuperAdminUser();
        
        if (success) {
          localStorage.setItem('superAdminAuth', 'true');
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
              <strong>Code PIN par défaut:</strong> 123456
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
