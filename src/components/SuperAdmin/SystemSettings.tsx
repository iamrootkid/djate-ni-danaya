
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Database, Shield, Activity } from "lucide-react";

export const SystemSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Paramètres Système</h2>
        <p className="text-gray-600">Configuration globale et maintenance du système</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Sauvegarde des Données
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Gérer les sauvegardes automatiques et manuelles de la base de données.
            </p>
            <div className="space-y-2">
              <Button className="w-full" variant="outline">
                Créer une sauvegarde maintenant
              </Button>
              <Button className="w-full" variant="outline">
                Programmer des sauvegardes
              </Button>
              <Button className="w-full" variant="outline">
                Restaurer une sauvegarde
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Sécurité et Accès
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Configurer les paramètres de sécurité et de contrôle d'accès.
            </p>
            <div className="space-y-2">
              <Button className="w-full" variant="outline">
                Réinitialiser tous les mots de passe
              </Button>
              <Button className="w-full" variant="outline">
                Configurer l'authentification 2FA
              </Button>
              <Button className="w-full" variant="outline">
                Gérer les sessions actives
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Monitoring Système
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Surveiller les performances et l'activité du système.
            </p>
            <div className="space-y-2">
              <Button className="w-full" variant="outline">
                Voir les logs d'activité
              </Button>
              <Button className="w-full" variant="outline">
                Rapports de performance
              </Button>
              <Button className="w-full" variant="outline">
                Alertes système
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuration Globale
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Paramètres généraux et configuration de l'application.
            </p>
            <div className="space-y-2">
              <Button className="w-full" variant="outline">
                Paramètres de notification
              </Button>
              <Button className="w-full" variant="outline">
                Configuration email
              </Button>
              <Button className="w-full" variant="outline">
                Maintenance système
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Zone de Danger</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Actions irréversibles qui affectent l'ensemble du système.
          </p>
          <div className="space-y-2">
            <Button variant="destructive" className="w-full">
              Réinitialiser toutes les données
            </Button>
            <Button variant="destructive" className="w-full">
              Supprimer tous les magasins inactifs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
