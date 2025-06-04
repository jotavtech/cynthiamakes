import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Brand, InsertBrand } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/queryClient";

interface BrandFormData {
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
}

const BrandManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [formData, setFormData] = useState<BrandFormData>({
    name: "",
    description: "",
    imageUrl: "",
    isActive: true
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Buscar marcas
  const { data: brands = [], isLoading } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
  });

  // Filtrar marcas baseado na visibilidade
  const filteredBrands = brands.filter(brand => 
    showInactive ? true : brand.isActive
  );

  // Mutation para criar marca
  const createBrandMutation = useMutation({
    mutationFn: async (data: InsertBrand) => {
      const response = await apiRequest("POST", "/api/brands", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Sucesso!",
        description: "Marca criada com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Erro ao criar marca:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar marca",
        variant: "destructive",
      });
    }
  });

  // Mutation para atualizar marca
  const updateBrandMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertBrand> }) => {
      const response = await apiRequest("PUT", `/api/brands/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
      setIsDialogOpen(false);
      setEditingBrand(null);
      resetForm();
      toast({
        title: "Sucesso!",
        description: "Marca atualizada com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Erro ao atualizar marca:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar marca",
        variant: "destructive",
      });
    }
  });

  // Mutation para deletar marca
  const deleteBrandMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/brands/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
      toast({
        title: "Sucesso!",
        description: "Marca deletada com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Erro ao deletar marca:", error);
      toast({
        title: "Erro",
        description: "Erro ao deletar marca",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      imageUrl: "",
      isActive: true
    });
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description || "",
      imageUrl: brand.imageUrl || "",
      isActive: brand.isActive
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da marca é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (editingBrand) {
      updateBrandMutation.mutate({
        id: editingBrand.id,
        data: formData
      });
    } else {
      createBrandMutation.mutate(formData);
    }
  };

  const handleDelete = (brand: Brand) => {
    deleteBrandMutation.mutate(brand.id);
  };

  const openNewBrandDialog = () => {
    setEditingBrand(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingBrand(null);
    resetForm();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Marcas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            Carregando marcas...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Gerenciar Marcas</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-inactive"
                checked={showInactive}
                onCheckedChange={setShowInactive}
              />
              <Label htmlFor="show-inactive" className="text-sm flex items-center gap-1">
                {showInactive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                Mostrar inativas
              </Label>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNewBrandDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Marca
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingBrand ? "Editar Marca" : "Nova Marca"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData(prev => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Nome da marca"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData(prev => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="Descrição da marca"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="imageUrl">URL da Imagem</Label>
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) =>
                        setFormData(prev => ({ ...prev, imageUrl: e.target.value }))
                      }
                      placeholder="https://exemplo.com/logo.png"
                      type="url"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) =>
                        setFormData(prev => ({ ...prev, isActive: checked }))
                      }
                    />
                    <Label htmlFor="isActive">Marca ativa</Label>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={closeDialog}>
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createBrandMutation.isPending || updateBrandMutation.isPending}
                    >
                      {editingBrand ? "Atualizar" : "Criar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredBrands.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {showInactive 
              ? "Nenhuma marca encontrada" 
              : "Nenhuma marca ativa encontrada"
            }
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBrands.map((brand) => (
              <Card key={brand.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{brand.name}</h3>
                      {brand.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {brand.description}
                        </p>
                      )}
                    </div>
                    <Badge variant={brand.isActive ? "default" : "secondary"}>
                      {brand.isActive ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>

                  {brand.imageUrl && (
                    <div className="mb-3">
                      <img 
                        src={brand.imageUrl} 
                        alt={brand.name}
                        className="w-16 h-16 object-contain rounded border"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(brand)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir a marca "{brand.name}"? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(brand)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BrandManager; 