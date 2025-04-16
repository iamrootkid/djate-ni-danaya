
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { loginFormSchema, LoginFormValues } from "./schemas/loginSchema";
import { EmailField } from "./form-fields/EmailField";
import { PasswordField } from "./form-fields/PasswordField";
import { RememberMeField } from "./form-fields/RememberMeField";
import { RoleInfoBox } from "./RoleInfoBox";
import { useLogin } from "@/hooks/use-login";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface LoginFormProps {
  selectedRole: 'admin' | 'employee';
  shopId: string;
  onBack: () => void;
  onForgotPassword: () => void;
}

export const LoginForm = ({ selectedRole, shopId, onBack, onForgotPassword }: LoginFormProps) => {
  const { loading, handleLogin } = useLogin(selectedRole);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: localStorage.getItem('rememberedEmail') || "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);
    
    // Limit login attempts (simple rate limiting on client-side)
    const now = Date.now();
    const lastLoginAttempt = parseInt(localStorage.getItem('lastLoginAttempt') || '0');
    const loginAttempts = parseInt(localStorage.getItem('loginAttempts') || '0');
    
    if (now - lastLoginAttempt < 60000 && loginAttempts >= 5) {
      setError("Trop de tentatives de connexion. Veuillez réessayer dans une minute.");
      return;
    }
    
    localStorage.setItem('lastLoginAttempt', now.toString());
    localStorage.setItem('loginAttempts', (now - lastLoginAttempt >= 60000 ? 1 : loginAttempts + 1).toString());
    
    try {
      await handleLogin(values, shopId);
    } catch (err: any) {
      setError(err.message || "Une erreur s'est produite lors de la connexion");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <EmailField form={form} />
        <PasswordField form={form} />
        
        <div className="flex items-center justify-between">
          <RememberMeField form={form} />
          <Button
            type="button"
            variant="link"
            className="text-sm text-primary"
            onClick={onForgotPassword}
          >
            Mot de passe oublié ?
          </Button>
        </div>
        
        <div className="space-y-4">
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dark text-white transition-colors"
            disabled={loading}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onBack}
          >
            Retour
          </Button>
          
          <RoleInfoBox selectedRole={selectedRole} />
        </div>
      </form>
    </Form>
  );
};
