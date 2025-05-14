import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Loader2, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Package,
  LayoutDashboard,
  LogOut,
  Search
} from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import ProductForm from "./ProductForm";
import { DisplayProduct } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const AdminPanel = () => {
  const { user, logout } = useAdmin();
  const { toast } = useToast();
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isViewProductOpen, setIsViewProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<DisplayProduct | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: products, isLoading, error, refetch } = useQuery<DisplayProduct[]>({
    queryKey: ["/api/products"],
  });
  
  const filteredProducts = products?.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = async (data: any) => {
    try {
      // Usando apiRequest para enviar credenciais corretamente
      await apiRequest("POST", "/api/products", data);
      
      setIsAddProductOpen(false);
      refetch();
      toast({
        title: "Sucesso",
        description: "Produto adicionado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar produto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = async (data: any) => {
    if (!selectedProduct) return;
    
    try {
      await apiRequest("PUT", `/api/products/${selectedProduct.id}`, data);
      
      setIsEditProductOpen(false);
      refetch();
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar produto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      await apiRequest("DELETE", `/api/products/${selectedProduct.id}`);
      
      setIsDeleteConfirmOpen(false);
      refetch();
      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir produto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold font-montserrat">Painel Administrativo</h1>
          <p className="text-gray-500">Bem-vindo, {user?.username}</p>
        </div>
        <Button onClick={logout} variant="outline">
          <LogOut className="mr-2 h-4 w-4" /> Sair
        </Button>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-2 md:w-[400px] mb-6">
          <TabsTrigger value="overview">
            <LayoutDashboard className="mr-2 h-4 w-4" /> Visão Geral
          </TabsTrigger>
          <TabsTrigger value="products">
            <Package className="mr-2 h-4 w-4" /> Produtos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total de Produtos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {products?.length || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Produtos cadastrados
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Produtos em Destaque
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {products?.filter(p => p.isFeatured).length || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Produtos em destaque na página inicial
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Produtos Novos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {products?.filter(p => p.isNew).length || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Produtos marcados como novos
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Produtos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  Erro ao carregar produtos. Por favor, tente novamente.
                </div>
              ) : products && products.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left text-xs font-medium text-gray-500 uppercase py-3">Produto</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase py-3">Categoria</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase py-3">Preço</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.slice(0, 5).map((product) => (
                        <tr key={product.id} className="border-b">
                          <td className="py-3">
                            <div className="flex items-center">
                              <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded object-cover mr-3" />
                              <div className="text-sm font-medium">{product.name}</div>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="text-sm text-gray-500">{product.category}</div>
                          </td>
                          <td className="py-3">
                            <div className="text-sm">{product.formattedPrice}</div>
                          </td>
                          <td className="py-3">
                            <div className="flex space-x-2">
                              {product.isFeatured && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Destaque</Badge>}
                              {product.isNew && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Novo</Badge>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhum produto cadastrado.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
                <CardTitle>Gerenciar Produtos</CardTitle>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Buscar produtos..."
                      className="pl-8 w-full md:w-[250px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => setIsAddProductOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Adicionar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  Erro ao carregar produtos. Por favor, tente novamente.
                </div>
              ) : filteredProducts && filteredProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Imagem
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Categoria
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Preço
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProducts.map((product) => (
                        <tr key={product.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {product.category}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {product.formattedPrice}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {product.isFeatured && (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                  Destaque
                                </Badge>
                              )}
                              {product.isNew && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Novo
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setIsViewProductOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setIsEditProductOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setIsDeleteConfirmOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? "Nenhum produto encontrado com os termos da busca." : "Nenhum produto cadastrado."}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Product Dialog */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Produto</DialogTitle>
          </DialogHeader>
          <ProductForm onSubmit={handleAddProduct} />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <ProductForm 
              onSubmit={handleEditProduct} 
              initialData={selectedProduct} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog open={isViewProductOpen} onOpenChange={setIsViewProductOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Produto</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6 py-2">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="w-full h-auto rounded-md object-cover"
                  />
                </div>
                <div className="md:w-2/3 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedProduct.name}</h3>
                    <p className="text-2xl font-bold text-primary mt-1">{selectedProduct.formattedPrice}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.isFeatured && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Destaque
                      </Badge>
                    )}
                    {selectedProduct.isNew && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Novo
                      </Badge>
                    )}
                    <Badge variant="outline" className="bg-gray-100">
                      {selectedProduct.category}
                    </Badge>
                    <Badge variant="outline" className="bg-gray-100">
                      {selectedProduct.brand}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Descrição</h4>
                    <p className="text-gray-700">{selectedProduct.description}</p>
                  </div>
                  {selectedProduct.videoUrl && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">URL do Vídeo</h4>
                      <p className="text-blue-600 break-all">
                        <a href={selectedProduct.videoUrl} target="_blank" rel="noopener noreferrer">
                          {selectedProduct.videoUrl}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsViewProductOpen(false)}
                >
                  Fechar
                </Button>
                <Button
                  onClick={() => {
                    setIsViewProductOpen(false);
                    setIsEditProductOpen(true);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" /> Editar Produto
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Tem certeza que deseja excluir o produto "{selectedProduct?.name}"? 
              Esta ação não pode ser desfeita.
            </p>
          </div>
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProduct}
            >
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
