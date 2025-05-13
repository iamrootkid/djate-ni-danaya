
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Category } from "@/types/inventory";
import { useToast, CustomToastProps } from "@/hooks/use-toast";
import { useShopId } from "@/hooks/use-shop-id";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const categorySchema = z.object({
  name: z.string().min(2, {
    message: "Category name must be at least 2 characters.",
  }),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface AddCategoryFormProps {
  onCategoryAdded?: (category: Category) => void;
  onSuccess?: () => void;
}

export function AddCategoryForm({ onCategoryAdded, onSuccess }: AddCategoryFormProps) {
  const { toast } = useToast();
  const { shopId } = useShopId();
  const queryClient = useQueryClient();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const { mutate: createCategory, isPending } = useMutation({
    mutationFn: async (values: CategoryFormValues) => {
      if (!shopId) {
        throw new Error("Shop ID not found");
      }

      const { data, error } = await supabase
        .from("categories")
        .insert({
          name: values.name,
          description: values.description,
          shop_id: shopId
        } as any)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as Category;
    },
    onSuccess: (data) => {
      toast({
        title: "Catégorie ajoutée",
        description: `La catégorie ${data.name} a été ajoutée avec succès.`,
      } as CustomToastProps);
      
      queryClient.invalidateQueries({ queryKey: ["categories", shopId] });
      form.reset();

      if (onCategoryAdded && data) {
        onCategoryAdded(data as Category);
      }
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'ajout de la catégorie.",
        variant: "destructive",
      } as CustomToastProps);
    },
  });

  const handleSubmit = async (values: CategoryFormValues) => {
    createCategory(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de la catégorie</FormLabel>
              <FormControl>
                <Input placeholder="Nom" {...field} />
              </FormControl>
              <FormDescription>
                Ce sera le nom visible de votre catégorie.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Description" {...field} />
              </FormControl>
              <FormDescription>
                Décrivez votre catégorie.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Ajout..." : "Ajouter"}
        </Button>
      </form>
    </Form>
  );
}
