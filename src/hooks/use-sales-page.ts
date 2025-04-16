
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useShopId } from "@/hooks/use-shop-id";
import { Product } from "@/types/sales";

export const useSalesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [userRole, setUserRole] = useState<"admin" | "employee">("employee");
  const { shopId } = useShopId();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (profileData?.role) {
          setUserRole(profileData.role as "admin" | "employee");
          
          if (profileData.role === "admin") {
            toast({
              title: "Accès restreint",
              description: "Cette page est réservée aux employés",
              variant: "destructive"
            });
            navigate("/dashboard");
          }
        }
      }
    };

    getUserRole();
  }, [navigate, toast]);

  useEffect(() => {
    if (!shopId) {
      console.error("No shop ID found, user should be redirected to login");
    }
  }, [shopId]);

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products", selectedCategory, shopId],
    queryFn: async () => {
      if (!shopId) return [];
      
      let query = supabase
        .from("products")
        .select(`
          *,
          categories:category_id (
            id,
            name
          )
        `)
        .eq("shop_id", shopId);
        
      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }
      
      query = query.order("name");
      
      const { data, error } = await query;
      if (error) throw error;
      return data as (Product & { categories: { name: string } | null })[];
    },
    enabled: !!shopId && userRole === "employee",
  });

  const { data: categoryData } = useQuery({
    queryKey: ["category", selectedCategory, shopId],
    queryFn: async () => {
      if (!selectedCategory || !shopId) return null;
      
      const { data, error } = await supabase
        .from("categories")
        .select("name")
        .eq("id", selectedCategory)
        .eq("shop_id", shopId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCategory && !!shopId && userRole === "employee",
  });

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    paymentMethod,
    setPaymentMethod,
    showCustomerDialog,
    setShowCustomerDialog,
    userRole,
    products,
    productsLoading,
    categoryData,
    shopId
  };
};
