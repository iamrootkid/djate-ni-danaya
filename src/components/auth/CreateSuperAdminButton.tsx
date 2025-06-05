
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Copy, Check } from "lucide-react";
import { createSuperAdmin } from "@/utils/createSuperAdmin";
import { toast } from "sonner";

export const CreateSuperAdminButton = () => {
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<{email: string, password: string} | null>(null);
  const [copied, setCopied] = useState<'email' | 'password' | null>(null);

  const handleCreateSuperAdmin = async () => {
    setLoading(true);
    try {
      const creds = await createSuperAdmin();
      setCredentials(creds);
    } catch (error) {
      console.error('Error creating super admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'email' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast.success(`${type === 'email' ? 'Email' : 'Mot de passe'} copié !`);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      toast.error('Erreur lors de la copie');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            Créer un Super Administrateur
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Créez un compte super administrateur pour accéder à l'interface de gestion globale.
          </p>
          
          <Button 
            onClick={handleCreateSuperAdmin}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Création en cours...' : 'Créer Super Admin'}
          </Button>

          {credentials && (
            <div className="mt-4 p-4 bg-purple-50 rounded-lg border">
              <h4 className="font-semibold text-purple-800 mb-3">Identifiants Super Admin</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-white rounded border">
                  <div>
                    <span className="text-xs text-gray-500">Email:</span>
                    <p className="font-mono text-sm">{credentials.email}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(credentials.email, 'email')}
                  >
                    {copied === 'email' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-white rounded border">
                  <div>
                    <span className="text-xs text-gray-500">Mot de passe:</span>
                    <p className="font-mono text-sm">{credentials.password}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(credentials.password, 'password')}
                  >
                    {copied === 'password' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="mt-3 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                <p className="text-xs text-yellow-800">
                  <strong>Important:</strong> Sauvegardez ces identifiants en lieu sûr. 
                  Vous pouvez maintenant vous connecter à <code>/super-admin</code>
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
