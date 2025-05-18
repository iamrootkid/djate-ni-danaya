
import { Badge } from "@/components/ui/badge";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface InvoiceStatusBadgeProps {
  isModified: boolean;
  modificationReason?: string;
}

export const InvoiceStatusBadge = ({ isModified, modificationReason }: InvoiceStatusBadgeProps) => {
  if (!isModified) {
    return (
      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
        Normal
      </Badge>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Modified
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>This invoice was modified</p>
          {modificationReason && <p className="text-xs mt-1">Reason: {modificationReason}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
