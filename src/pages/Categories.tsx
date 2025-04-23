import { useEffect, useState } from "react";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Pencil, Trash2 } from "lucide-react";
import { useShopData } from "@/hooks/use-shop-data";
import { AddCategoryForm } from "@/components/Categories/AddCategoryForm";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "@/components/ui/DeleteDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

const Categories = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const { toast } = useToast();
  const { useShopQuery, useShopMutation } = useShopData();

  const { data: categories, isLoading, refetch } = useShopQuery(
    ["categories"],
    "categories",
    {
      select: "id, name, description, created_at",
      enabled: true
    }
  );

  const { update, remove } = useShopMutation("categories", {
    onSuccess: () => {
      refetch();
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating category:", error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    }
  });

  const handleDelete = async () => {
    if (!selectedCategory) return;

    try {
      await remove(selectedCategory.id);
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async () => {
    if (!selectedCategory) return;

    try {
      await update(selectedCategory.id, {
        name: editName,
        description: editDescription,
      });
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setEditName(category.name);
    setEditDescription(category.description || "");
    setEditDialogOpen(true);
  };

  const filteredCategories = categories?.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Catégories</h2>
          <AddCategoryForm onSuccess={refetch} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des catégories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher des catégories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Aucune catégorie trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{category.description || "-"}</TableCell>
                      <TableCell>
                        {new Date(category.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditDialog(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setSelectedCategory(category);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedCategory(null);
        }}
        onConfirm={handleDelete}
        title="Supprimer la catégorie"
        description="Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action ne peut pas être annulée."
      />

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la catégorie</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Nom
              </label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <Input
                id="description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleEdit}>Enregistrer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Categories;