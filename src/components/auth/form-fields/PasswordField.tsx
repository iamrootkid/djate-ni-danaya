
import { Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { LoginFormValues } from "../schemas/loginSchema";

interface PasswordFieldProps {
  form: UseFormReturn<LoginFormValues>;
}

export const PasswordField = ({ form }: PasswordFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="password"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Mot de passe</FormLabel>
          <FormControl>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input {...field} type="password" className="pl-10" placeholder="Entrez votre mot de passe" />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
