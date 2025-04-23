
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { LoginFormValues } from "../schemas/loginSchema";

interface RememberMeFieldProps {
  form: UseFormReturn<LoginFormValues>;
}

export const RememberMeField = ({ form }: RememberMeFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="rememberMe"
      render={({ field }) => (
        <FormItem className="flex items-center space-x-2">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <FormLabel className="text-sm">Se souvenir de moi</FormLabel>
        </FormItem>
      )}
    />
  );
};
