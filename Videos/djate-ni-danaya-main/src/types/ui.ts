
import { HTMLAttributes } from "react";
import { VariantProps } from "class-variance-authority";
import { badgeVariants } from "@/components/ui/badge";

// Extended Badge Props to include children
export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  children?: React.ReactNode;
}
