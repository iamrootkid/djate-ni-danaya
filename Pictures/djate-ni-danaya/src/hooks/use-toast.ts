
// Re-export the toast hook and provider from the UI components
import { 
  type ToastActionElement,
  type ToastProps,
  ToastProvider as ToastProviderUI,
} from "@/components/ui/toast";

import {
  useToast as useToastOriginal, 
  toast as toastOriginal,
  ToastProvider as ToastProviderContext
} from "@/components/ui/use-toast";

import { ReactNode } from "react";

// Create more specific type for our Toast props that includes description
export interface CustomToastProps extends ToastProps {
  title?: ReactNode;
  description?: ReactNode;
  variant?: "default" | "destructive";
  action?: ToastActionElement;
}

// Export the providers and hooks
export { 
  ToastProviderUI,
  ToastProviderContext,
  useToastOriginal as useToast, 
  toastOriginal as toast
};

export type { 
  ToastProps, 
  ToastActionElement,
  CustomToastProps
};
