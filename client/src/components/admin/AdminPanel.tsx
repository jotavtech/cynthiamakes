import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import ProductForm from "./ProductForm";
import { DisplayProduct } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const AdminPanel = () => {
  const { logout } = useAdmin();
  const { toast } = useToast();
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<DisplayProduct | null>(null);

  const { data: products, isLoading, error, refetch } = useQuery<DisplayProduct[]>({
    queryKey: ["/api/products"],
  });

  const handleAddProduct = async (data: any) => {
    try {
      await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
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
      await fetch(`/api/products/${selectedProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
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
      await fetch(`/api/products/${selectedProduct.id}`, {
        method: "DELETE",
      });
      
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-montserrat">Painel Administrativo</h1>
        <Button onClick={logout} variant="outline">Sair</Button>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold font-montserrat">Produtos</h2>
            <Button onClick={() => setIsAddProductOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar Produto
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Erro ao carregar produtos. Por favor, tente novamente.
            </div>
          ) : (
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
                      Destaque
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Novo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products?.map((product) => (
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
                        <div className="text-sm text-gray-500">
                          {product.isFeatured ? "Sim" : "Não"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {product.isNew ? "Sim" : "Não"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
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
          )}
        </CardContent>
      </Card>

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
