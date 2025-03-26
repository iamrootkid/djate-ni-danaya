
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { StaffList } from "./StaffList";
import { DepartmentList } from "./DepartmentList";

interface StaffTabsProps {
  onEditEmployee: (employee: any) => void;
  onDeleteEmployee: (employee: any) => void;
  onAddDepartment: () => void;
  onEditDepartment: (department: any) => void;
  onDeleteDepartment: (department: any) => void;
}

export const StaffTabs = ({
  onEditEmployee,
  onDeleteEmployee,
  onAddDepartment,
  onEditDepartment,
  onDeleteDepartment,
}: StaffTabsProps) => {
  return (
    <Tabs defaultValue="employees">
      <TabsList>
        <TabsTrigger value="employees">Employees</TabsTrigger>
        <TabsTrigger value="departments">Departments</TabsTrigger>
      </TabsList>
      <TabsContent value="employees" className="mt-6">
        <StaffList />
      </TabsContent>
      <TabsContent value="departments" className="mt-6">
        <div className="mb-4">
          <Button onClick={onAddDepartment}>
            Add Department
          </Button>
        </div>
        <DepartmentList
          onEdit={onEditDepartment}
          onDelete={onDeleteDepartment}
        />
      </TabsContent>
    </Tabs>
  );
};
