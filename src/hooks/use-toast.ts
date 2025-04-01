
import { useToast as useToastOriginal, toast as toastOriginal } from "@/components/ui/use-toast";

// Re-export the useToast hook and toast function
export const useToast = useToastOriginal;
export const toast = toastOriginal;
