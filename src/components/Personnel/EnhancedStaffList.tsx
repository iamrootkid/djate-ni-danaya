import { User, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

export const EnhancedStaffList = ({ staff }: { staff: Array<{ id: string; name: string; role: string; isActive: boolean; email: string; phone: string }> }) => {
  const isMobile = useIsMobile();

  return (
    <Card className={isMobile ? "bg-white dark:bg-[#18181b] rounded-xl shadow-sm" : undefined}>
      <CardContent className={isMobile ? "p-4" : undefined}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {staff.map((member) => (
            <div
              key={member.id}
              className="bg-card rounded-lg shadow-sm border border-border p-2 md:p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className="relative">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    </div>
                    {member.isActive && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm md:text-base">{member.name}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <Badge
                  variant={member.isActive ? "success" : "secondary"}
                  className="text-xs md:text-sm"
                >
                  {member.isActive ? "Actif" : "Inactif"}
                </Badge>
              </div>
              <div className="mt-2 md:mt-3 flex items-center justify-between text-xs md:text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Mail className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  {member.email}
                </div>
                <div className="flex items-center">
                  <Phone className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  {member.phone}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}; 