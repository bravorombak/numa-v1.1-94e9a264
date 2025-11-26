import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccessDenied } from "@/components/common/AccessDenied";
import { useAuthStore } from "@/stores/authStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollableTable } from "@/components/common/ScrollableTable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useModels, useDeleteModel, type Model } from "@/hooks/useModels";
import { ModelStatusBadge } from "@/components/models/ModelStatusBadge";
import { ModelDialog } from "@/components/models/ModelDialog";

const AdminApiPage = () => {
  const { profile } = useAuthStore();
  const role = profile?.role || 'user';
  
  const { data: models, isLoading } = useModels();
  const deleteModel = useDeleteModel();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);

  // Admin-only guard
  if (role !== 'admin') {
    return <AccessDenied message="Only Admins can access the Model Registry." />;
  }

  const handleCreate = () => {
    setEditingModel(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (model: Model) => {
    setEditingModel(model);
    setDialogOpen(true);
  };

  const handleDeleteClick = (modelId: string) => {
    setModelToDelete(modelId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (modelToDelete) {
      await deleteModel.mutateAsync(modelToDelete);
      setDeleteDialogOpen(false);
      setModelToDelete(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Model Registry</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage AI models and their configurations
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Create Model
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading models...</p>
        </div>
      ) : !models || models.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No models found</p>
          <Button onClick={handleCreate} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Create your first model
          </Button>
        </div>
      ) : (
        <ScrollableTable minWidth="min-w-[750px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Provider Model</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Max Tokens</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.id}>
                  <TableCell className="font-medium">{model.name}</TableCell>
                  <TableCell className="capitalize">{model.provider}</TableCell>
                  <TableCell className="font-mono text-sm">{model.provider_model}</TableCell>
                  <TableCell>
                    <ModelStatusBadge status={model.status} />
                  </TableCell>
                  <TableCell>{model.max_tokens || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(model)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(model.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollableTable>
      )}

      <ModelDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        model={editingModel}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Model</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this model? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminApiPage;
