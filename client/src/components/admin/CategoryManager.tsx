import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Globe,
  ImageIcon,
  Loader2,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Category, InsertCategory } from "@shared/schema";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import { useAdmin } from "@/hooks/useAdmin";
import { useAdminSession } from "@/hooks/useAdminSession";

const CategoryManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // Estados para gerenciamento de imagens
  const [addImageUrl, setAddImageUrl] = useState<string>("");
  const [editImageUrl, setEditImageUrl] = useState<string>("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAdmin();
  const { handleApiError } = useAdminSession();

  // Query para buscar categorias
  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Função para verificar autenticação antes de operações admin
  const checkAuth = (): boolean => {
    if (!user || !user.isAdmin) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado como administrador para realizar esta ação. Recarregue a página e faça login.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  // Mutation para criar categoria
  const createCategoryMutation = useMutation({
    mutationFn: async (data: InsertCategory) => {
      if (!checkAuth()) {
        throw new Error("Não autenticado");
      }
      const response = await apiRequest("POST", "/api/categories", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Categoria adicionada!",
        description: "A categoria foi criada com sucesso.",
      });
      setIsAddOpen(false);
      resetModalStates();
    },
    onError: (error: any) => {
      console.error("Error creating category:", error);
      handleApiError(error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a categoria. Verifique se você está logado como administrador.",
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar categoria
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertCategory> }) => {
      if (!checkAuth()) {
        throw new Error("Não autenticado");
      }
      const response = await apiRequest("PUT", `/api/categories/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Categoria atualizada!",
        description: "A categoria foi atualizada com sucesso.",
      });
      setIsEditOpen(false);
      resetModalStates();
    },
    onError: (error: any) => {
      console.error("Error updating category:", error);
      handleApiError(error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a categoria. Verifique se você está logado como administrador.",
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar categoria
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!checkAuth()) {
        throw new Error("Não autenticado");
      }
      await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Categoria removida!",
        description: "A categoria foi removida com sucesso.",
      });
      setIsDeleteOpen(false);
      setSelectedCategory(null);
    },
    onError: (error: any) => {
      console.error("Error deleting category:", error);
      handleApiError(error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a categoria. Verifique se você está logado como administrador.",
        variant: "destructive",
      });
    },
  });

  // Função para upload de imagem
  const uploadImage = async (file: File): Promise<string> => {
    // Criar FormData para envio
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Erro no upload');
      }
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Erro no upload:', error);
      throw new Error('Falha no upload da imagem');
    }
  };

  // Função para resetar states dos modais
  const resetModalStates = () => {
    setAddImageUrl("");
    setEditImageUrl("");
    setSelectedCategory(null);
  };

  // Filtrar categorias baseado na busca
  const filteredCategories = categories?.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Função para gerar slug automaticamente
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .trim();
  };

  // Função para adicionar categoria
  const handleAddCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const manualImageUrl = formData.get('imageUrl') as string;
    const slug = generateSlug(name);

    // Usa a imagem do dropzone se disponível, senão usa a URL manual, senão usa placeholder
    const finalImageUrl = addImageUrl || manualImageUrl || "https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=Categoria";
    
    const categoryData: InsertCategory = {
      name,
      description,
      imageUrl: finalImageUrl,
      slug,
      isActive: true
    };

    createCategoryMutation.mutate(categoryData);
  };

  // Função para editar categoria
  const handleEditCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCategory) return;

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const manualImageUrl = formData.get('imageUrl') as string;

    // Usa a imagem do dropzone se disponível, senão usa a URL manual, senão mantém a atual
    const finalImageUrl = editImageUrl || manualImageUrl || selectedCategory.imageUrl;
    
    const categoryData: Partial<InsertCategory> = {
      name,
      description,
      imageUrl: finalImageUrl,
      slug: generateSlug(name)
    };

    updateCategoryMutation.mutate({ id: selectedCategory.id, data: categoryData });
  };

  // Função para deletar categoria
  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    deleteCategoryMutation.mutate(selectedCategory.id);
  };

  // Função para alternar status da categoria
  const toggleCategoryStatus = (category: Category) => {
    if (!checkAuth()) return;
    
    updateCategoryMutation.mutate({ 
      id: category.id, 
      data: { isActive: !category.isActive } 
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        Erro ao carregar categorias. Por favor, tente novamente.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Aviso quando não está logado */}
      {(!user || !user.isAdmin) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Acesso limitado
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Você está visualizando as categorias em modo somente leitura. 
                  Para adicionar, editar ou remover categorias, 
                  <strong> faça login como administrador</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
            <div>
              <CardTitle>Gerenciar Categorias</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Adicione, edite ou remova categorias de produtos. As imagens das categorias são exibidas na página inicial.
              </p>
            </div>
            <div className="flex space-x-2">
              <Input
                type="search"
                placeholder="Buscar categorias..."
                className="w-full md:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button 
                onClick={() => setIsAddOpen(true)}
                disabled={!user || !user.isAdmin}
              >
                <Plus className="mr-2 h-4 w-4" /> Adicionar Categoria
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category) => (
                <Card key={category.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => toggleCategoryStatus(category)}
                        disabled={!user || !user.isAdmin}
                        className={`p-1 rounded-full bg-white/80 backdrop-blur-sm ${(!user || !user.isAdmin) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'}`}
                      >
                        {category.isActive ? (
                          <ToggleRight className="h-5 w-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      <div className="flex items-center space-x-1">
                        {category.isActive ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Ativa
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                            Inativa
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{category.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span className="flex items-center">
                        <Globe className="h-3 w-3 mr-1" />
                        /{category.slug}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!user || !user.isAdmin}
                        onClick={() => {
                          setSelectedCategory(category);
                          setEditImageUrl(category.imageUrl);
                          setIsEditOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!user || !user.isAdmin}
                        onClick={() => {
                          setSelectedCategory(category);
                          setIsDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1 text-red-500" />
                        Remover
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {searchTerm ? (
                <>
                  <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Nenhuma categoria encontrada</p>
                  <p className="text-sm">Tente ajustar os termos da busca</p>
                </>
              ) : (
                <>
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Nenhuma categoria cadastrada</p>
                  <p className="text-sm">Comece adicionando a primeira categoria</p>
                  <Button 
                    onClick={() => setIsAddOpen(true)} 
                    className="mt-4"
                    disabled={!user || !user.isAdmin}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Primeira Categoria
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para adicionar categoria */}
      <Dialog open={isAddOpen} onOpenChange={(open) => {
        setIsAddOpen(open);
        if (!open) resetModalStates();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Categoria</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCategory}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Categoria *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ex: Maquiagem para Olhos"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Descreva os produtos incluídos nesta categoria..."
                  required
                />
              </div>
              
              {/* Campo de upload por arrastar e soltar */}
              <div className="space-y-2">
                <Label>Imagem da Categoria</Label>
                <ImageDropzone
                  onImageUpload={async (file) => {
                    const url = await uploadImage(file);
                    setAddImageUrl(url);
                    return url;
                  }}
                  currentImage={addImageUrl}
                  onImageRemove={() => setAddImageUrl("")}
                  disabled={createCategoryMutation.isPending}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Ou cole uma URL da Imagem</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
                <p className="text-xs text-gray-500">
                  Deixe em branco para usar uma imagem padrão. Recomendado: 600x600px ou maior.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setIsAddOpen(false);
                resetModalStates();
              }}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createCategoryMutation.isPending}>
                {createCategoryMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Adicionar Categoria
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para editar categoria */}
      <Dialog open={isEditOpen} onOpenChange={(open) => {
        setIsEditOpen(open);
        if (!open) resetModalStates();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <form onSubmit={handleEditCategory}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome da Categoria *</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={selectedCategory.name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Descrição *</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    defaultValue={selectedCategory.description}
                    required
                  />
                </div>
                
                {/* Campo de upload por arrastar e soltar */}
                <div className="space-y-2">
                  <Label>Imagem da Categoria</Label>
                  <ImageDropzone
                    onImageUpload={async (file) => {
                      const url = await uploadImage(file);
                      setEditImageUrl(url);
                      return url;
                    }}
                    currentImage={editImageUrl}
                    onImageRemove={() => setEditImageUrl(selectedCategory.imageUrl)}
                    disabled={updateCategoryMutation.isPending}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-imageUrl">Ou cole uma URL da Imagem</Label>
                  <Input
                    id="edit-imageUrl"
                    name="imageUrl"
                    type="url"
                    defaultValue={selectedCategory.imageUrl}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsEditOpen(false);
                  resetModalStates();
                }}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateCategoryMutation.isPending}>
                  {updateCategoryMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para confirmar exclusão */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria "{selectedCategory?.name}"? 
              Esta ação não pode ser desfeita e pode afetar produtos relacionados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              disabled={deleteCategoryMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteCategoryMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removendo...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir Categoria
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoryManager; 