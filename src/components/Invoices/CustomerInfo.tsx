
import { Phone } from "lucide-react";

interface CustomerInfoProps {
  name: string;
  phone?: string;
}

export const CustomerInfo = ({ name, phone }: CustomerInfoProps) => {
  return (
    <div className="flex flex-col">
      <span>{name}</span>
      {phone && (
        <div className="flex items-center text-xs text-gray-500">
          <Phone className="h-3 w-3 mr-1" />
          {phone}
        </div>
      )}
    </div>
  );
};
