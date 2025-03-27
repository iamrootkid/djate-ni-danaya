
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { toast as sonnerToast } from "sonner";

export const useAddEmployee = (onSuccess: () => void) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setRole("");
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate role is selected
    if (!role) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un rôle (Admin ou Employé)",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Get current shop ID from localStorage
    const shopId = localStorage.getItem("shopId");
    if (!shopId) {
      toast({
        title: "Erreur",
        description: "Aucun magasin sélectionné. Veuillez vous reconnecter.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    try {
      console.log("Calling create-employee with data:", {
        email, password, firstName, lastName, phone, role, shopId
      });
      
      const { data, error } = await supabase.functions.invoke('create-employee', {
        body: {
          email,
          password,
          firstName,
          lastName,
          phone,
          role,
          shopId: shopId // Ensure the shop ID is passed
        },
        method: 'POST'
      });

      if (error) {
        // Extract error message from the response body if it exists
        let errorMessage = error.message;
        try {
          const errorBody = JSON.parse(error.message);
          if (errorBody.error) {
            errorMessage = errorBody.error;
          }
        } catch (e) {
          // If parsing fails, use the original error message
          console.error("Error parsing error message:", e);
          console.log("Original error:", error);
        }

        throw new Error(errorMessage);
      }

      // Use more descriptive success message that mentions the role
      const roleText = role === 'admin' ? 'Administrateur' : 'Employé';
      
      toast({
        title: "Succès",
        description: `${roleText} ajouté avec succès. L'utilisateur pourra se connecter avec le rôle "${roleText}".`,
      });
      
      // Also show a more visible toast with Sonner for important information
      sonnerToast.success(
        `${firstName} ${lastName} a été ajouté en tant que ${roleText}`,
        {
          description: `Cet utilisateur pourra se connecter uniquement en tant que ${roleText} pour ce magasin.`,
          duration: 5000,
        }
      );

      resetForm();
      setIsDialogOpen(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error adding employee:", error);
      toast({
        title: "Erreur",
        description: error.message || "Échec de l'ajout de l'employé",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    phone,
    setPhone,
    role,
    setRole,
    password,
    setPassword,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    handleSubmit
  };
};
