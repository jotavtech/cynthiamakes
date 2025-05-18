import { useState, useMemo } from "react";
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
  Search,
  Boxes,
  AlertTriangle,
  BarChart3,
  PlusCircle,
  MinusCircle,
  Truck,
  History,
  ShoppingBag,
  Check,
  X,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Calendar,
  CreditCard,
  DollarSign,
  ClipboardCheck,
  TrendingUp,
  Users
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
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@/components/ui/badge";

// Dados mockup para demonstração
const MOCK_ORDERS = [
  { 
    id: 1, 
    customer: "Maria Silva", 
    email: "maria@example.com", 
    phone: "83998765432", 
    date: "2025-05-17", 
    status: "pending", 
    total: 16980,
    items: [
      { productId: 2, productName: "Batom Matte Longa Duração", quantity: 2, price: 4990 },
      { productId: 3, productName: "Paleta de Sombras Glamour", quantity: 1, price: 12990 }
    ]
  },
  { 
    id: 2, 
    customer: "Ana Paula", 
    email: "ana@example.com", 
    phone: "83987654321", 
    date: "2025-05-16", 
    status: "completed", 
    total: 32960,
    items: [
      { productId: 2, productName: "Batom Matte Longa Duração", quantity: 1, price: 4990 },
      { productId: 3, productName: "Paleta de Sombras Glamour", quantity: 1, price: 12990 },
      { productId: 1, productName: "Base Líquida Ultra HD", quantity: 1, price: 14980 }
    ]
  },
  { 
    id: 3, 
    customer: "Fernanda Costa", 
    email: "fernanda@example.com", 
    phone: "83994443333", 
    date: "2025-05-15", 
    status: "cancelled", 
    total: 14980,
    items: [
      { productId: 1, productName: "Base Líquida Ultra HD", quantity: 1, price: 14980 }
    ]
  }
];

// Dados mockup para o histórico de vendas de pedidos finalizados
const MOCK_SALES_HISTORY = [
  { 
    month: "Janeiro", 
    year: 2025, 
    sales: 28, 
    revenue: 389500, 
    topProduct: "Base Líquida Ultra HD", 
    topCategory: "face", 
    topBrand: "Cynthia Beauty",
    completedOrders: [
      { id: 101, date: "2025-01-05", customer: "Mariana Santos", total: 29970 },
      { id: 102, date: "2025-01-12", customer: "Carolina Lima", total: 44960 },
      { id: 103, date: "2025-01-18", customer: "Tatiana Mendes", total: 19980 }
    ]
  },
  { 
    month: "Fevereiro", 
    year: 2025, 
    sales: 42, 
    revenue: 612000, 
    topProduct: "Paleta de Sombras Glamour", 
    topCategory: "eyes", 
    topBrand: "Cynthia Beauty",
    completedOrders: [
      { id: 104, date: "2025-02-03", customer: "Letícia Ferreira", total: 32960 },
      { id: 105, date: "2025-02-15", customer: "Pamela Costa", total: 27970 },
      { id: 106, date: "2025-02-22", customer: "Renata Silva", total: 59950 }
    ]
  },
  { 
    month: "Março", 
    year: 2025, 
    sales: 36, 
    revenue: 485700, 
    topProduct: "Base Líquida Ultra HD", 
    topCategory: "face", 
    topBrand: "Cynthia Beauty",
    completedOrders: [
      { id: 107, date: "2025-03-08", customer: "Fernanda Costa", total: 24980 },
      { id: 108, date: "2025-03-17", customer: "Ana Paula", total: 32960 },
      { id: 109, date: "2025-03-25", customer: "Bianca Souza", total: 37950 }
    ]
  },
  { 
    month: "Abril", 
    year: 2025, 
    sales: 51, 
    revenue: 729000, 
    topProduct: "Batom Matte Longa Duração", 
    topCategory: "lips", 
    topBrand: "Cynthia Beauty",
    completedOrders: [
      { id: 110, date: "2025-04-02", customer: "Patrícia Oliveira", total: 42970 },
      { id: 111, date: "2025-04-14", customer: "Gabriela Almeida", total: 30980 },
      { id: 112, date: "2025-04-23", customer: "Juliana Martins", total: 54950 }
    ]
  },
  { 
    month: "Maio", 
    year: 2025, 
    sales: 33, 
    revenue: 421800, 
    topProduct: "Paleta de Sombras Glamour", 
    topCategory: "eyes", 
    topBrand: "Cynthia Beauty",
    completedOrders: [
      { id: 113, date: "2025-05-07", customer: "Luiza Campos", total: 37960 },
      { id: 114, date: "2025-05-16", customer: "Carla Moreira", total: 45970 },
      { id: 2, date: "2025-05-16", customer: "Ana Paula", total: 32960 }
    ]
  }
];

const AdminPanel = () => {
  const { user, logout } = useAdmin();
  const { toast } = useToast();
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isViewProductOpen, setIsViewProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<DisplayProduct | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("products");
  const [isAdjustStockOpen, setIsAdjustStockOpen] = useState(false);
  const [stockAction, setStockAction] = useState<"add" | "remove" | null>(null);
  
  // Estados para as novas funcionalidades de vendas e histórico
  const [salesSearchTerm, setSalesSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [isAddSaleOpen, setIsAddSaleOpen] = useState(false);
  const [historySortField, setHistorySortField] = useState("month");
  const [historySortDirection, setHistorySortDirection] = useState<"asc" | "desc">("desc");

  const { data: products, isLoading, error, refetch } = useQuery<DisplayProduct[]>({
    queryKey: ["/api/products"],
  });
  
  const { data: lowStockProducts, isLoading: isLoadingLowStock } = useQuery<DisplayProduct[]>({
    queryKey: ["/api/inventory/low-stock"],
    enabled: activeTab === "inventory"
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
  
  const handleAdjustStock = async (data: { quantity: number, notes: string }) => {
    if (!selectedProduct || !stockAction) return;
    
    try {
      // Converter quantidade para positivo ou negativo dependendo da ação
      const stockChange = stockAction === "add" ? 
        Math.abs(data.quantity) : 
        -Math.abs(data.quantity);
      
      // Determinar o tipo de transação
      const transactionType = stockAction === "add" ? "purchase" : "adjustment";
      
      await apiRequest("POST", "/api/inventory/update-stock", {
        productId: selectedProduct.id,
        stockChange,
        transactionType,
        notes: data.notes || ""
      });
      
      setIsAdjustStockOpen(false);
      refetch();
      toast({
        title: "Sucesso",
        description: stockAction === "add" ? 
          "Estoque adicionado com sucesso!" : 
          "Estoque reduzido com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao ajustar o estoque. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Função para rolar para o topo da página
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Função para rolar para o final da página
  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  return (
    <div className="p-4 md:p-6 relative">
      {/* Botões flutuantes para navegação na página */}
      <div className="fixed right-6 bottom-24 z-50 flex flex-col gap-2">
        <Button 
          onClick={scrollToTop} 
          size="icon" 
          className="bg-white/80 backdrop-blur-sm shadow-lg hover:bg-accent hover:text-white rounded-full transition-all"
          aria-label="Rolar para o topo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-up"><path d="m18 15-6-6-6 6"/></svg>
        </Button>
        <Button 
          onClick={scrollToBottom} 
          size="icon" 
          className="bg-white/80 backdrop-blur-sm shadow-lg hover:bg-accent hover:text-white rounded-full transition-all"
          aria-label="Rolar para o final"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold font-montserrat">Painel Administrativo</h1>
          <p className="text-gray-500">Bem-vindo, {user?.username || 'Administrador'}</p>
        </div>
        <Button onClick={logout} variant="outline">
          <LogOut className="mr-2 h-4 w-4" /> Sair
        </Button>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-5 md:w-[800px] mb-6">
          <TabsTrigger value="overview">
            <LayoutDashboard className="mr-2 h-4 w-4" /> Visão Geral
          </TabsTrigger>
          <TabsTrigger value="products">
            <Package className="mr-2 h-4 w-4" /> Produtos
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <Boxes className="mr-2 h-4 w-4" /> Estoque
          </TabsTrigger>
          <TabsTrigger value="sales">
            <ShoppingBag className="mr-2 h-4 w-4" /> Vendas
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" /> Histórico
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
        
        <TabsContent value="inventory">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-700">
                  <AlertTriangle className="h-4 w-4 inline-block mr-2" />
                  Produtos com Baixo Estoque
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-700">
                  {lowStockProducts?.filter(p => p.stockStatus === "low_stock").length || 0}
                </div>
                <p className="text-xs text-amber-700 mt-1">
                  Produtos com estoque abaixo do limite
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-red-50 border-red-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-700">
                  <AlertTriangle className="h-4 w-4 inline-block mr-2" />
                  Produtos Esgotados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-700">
                  {lowStockProducts?.filter(p => p.stockStatus === "out_of_stock").length || 0}
                </div>
                <p className="text-xs text-red-700 mt-1">
                  Produtos sem estoque disponível
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  <BarChart3 className="h-4 w-4 inline-block mr-2" />
                  Total de Produtos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {products?.length || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Produtos no catálogo
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingLowStock ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
              ) : lowStockProducts && lowStockProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Produto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          SKU
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estoque Atual
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Limite de Estoque
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
                      {lowStockProducts.map((product) => (
                        <tr key={product.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="h-10 w-10 rounded-md object-cover mr-3"
                              />
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {product.sku || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {product.stock}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {product.lowStockThreshold}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {product.stockStatus === "out_of_stock" ? (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                Esgotado
                              </Badge>
                            ) : product.stockStatus === "low_stock" ? (
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                Baixo Estoque
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Em Estoque
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-600 hover:bg-green-50"
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setStockAction("add");
                                  setIsAdjustStockOpen(true);
                                }}
                              >
                                <PlusCircle className="h-4 w-4 mr-1" /> Adicionar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setStockAction("remove");
                                  setIsAdjustStockOpen(true);
                                }}
                                disabled={product.stock <= 0}
                              >
                                <MinusCircle className="h-4 w-4 mr-1" /> Remover
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
                  Nenhum produto com baixo estoque encontrado.
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

        {/* Aba de Vendas */}
        <TabsContent value="sales">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Confirmação de Vendas</h2>
              <Button onClick={() => setIsAddSaleOpen(true)} className="bg-accent hover:bg-accent/90">
                <Plus className="mr-2 h-4 w-4" /> Adicionar Venda
              </Button>
            </div>

            <div className="bg-white p-4 rounded-md shadow-sm mb-6">
              <div className="flex flex-col md:flex-row gap-4 md:items-center mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por cliente, email, telefone..."
                    className="pl-10"
                    value={salesSearchTerm}
                    onChange={(e) => setSalesSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" /> Filtrar por Data
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <ArrowUpDown className="mr-2 h-4 w-4" /> Ordenar
                  </Button>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Pedidos Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                        <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                        <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_ORDERS.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 text-sm font-medium">{order.id}</td>
                          <td className="py-4 text-sm">
                            <div>
                              <span className="font-medium">{order.customer}</span>
                              <div className="text-gray-500 text-xs">{order.phone}</div>
                            </div>
                          </td>
                          <td className="py-4 text-sm">
                            {new Date(order.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-4 text-sm font-medium">
                            {`R$ ${(order.total / 100).toFixed(2).replace('.', ',')}`}
                          </td>
                          <td className="py-4 text-sm">
                            {order.status === 'pending' ? (
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                Pendente
                              </Badge>
                            ) : order.status === 'completed' ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Concluído
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                Cancelado
                              </Badge>
                            )}
                          </td>
                          <td className="py-4 text-sm">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setIsOrderDetailsOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {order.status === 'pending' && (
                                <>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Check className="h-4 w-4 text-green-500" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <X className="h-4 w-4 text-red-500" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba de Histórico */}
        <TabsContent value="history">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Histórico de Vendas</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  if (historySortField === "month") {
                    setHistorySortDirection(prev => prev === "asc" ? "desc" : "asc");
                  } else {
                    setHistorySortField("month");
                    setHistorySortDirection("desc");
                  }
                }}>
                  {historySortField === "month" ? (
                    <>
                      Data {historySortDirection === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                    </>
                  ) : "Data"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  if (historySortField === "revenue") {
                    setHistorySortDirection(prev => prev === "asc" ? "desc" : "asc");
                  } else {
                    setHistorySortField("revenue");
                    setHistorySortDirection("desc");
                  }
                }}>
                  {historySortField === "revenue" ? (
                    <>
                      Valor {historySortDirection === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                    </>
                  ) : "Valor"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  if (historySortField === "topProduct") {
                    setHistorySortDirection(prev => prev === "asc" ? "desc" : "asc");
                  } else {
                    setHistorySortField("topProduct");
                    setHistorySortDirection("asc");
                  }
                }}>
                  {historySortField === "topProduct" ? (
                    <>
                      A-Z {historySortDirection === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                    </>
                  ) : "A-Z"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="bg-green-50 border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-700">
                    <TrendingUp className="h-4 w-4 inline-block mr-2" />
                    Receita Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">
                    {`R$ ${(MOCK_SALES_HISTORY.reduce((acc, month) => acc + month.revenue, 0) / 100).toFixed(2).replace('.', ',')}`}
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Receita total acumulada
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700">
                    <ShoppingBag className="h-4 w-4 inline-block mr-2" />
                    Total de Vendas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-700">
                    {MOCK_SALES_HISTORY.reduce((acc, month) => acc + month.sales, 0)}
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    Pedidos finalizados
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-purple-50 border-purple-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700">
                    <Users className="h-4 w-4 inline-block mr-2" />
                    Ticket Médio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-700">
                    {`R$ ${((MOCK_SALES_HISTORY.reduce((acc, month) => acc + month.revenue, 0) / 
                      MOCK_SALES_HISTORY.reduce((acc, month) => acc + month.sales, 0)) / 100).toFixed(2).replace('.', ',')}`}
                  </div>
                  <p className="text-xs text-purple-700 mt-1">
                    Valor médio por pedido
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Detalhamento Mensal (Vendas Finalizadas)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase">Mês/Ano</th>
                        <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendas</th>
                        <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase">Receita</th>
                        <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto Mais Vendido</th>
                        <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                        <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_SALES_HISTORY
                        .sort((a, b) => {
                          if (historySortField === "month") {
                            const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
                            const aIndex = months.indexOf(a.month);
                            const bIndex = months.indexOf(b.month);
                            return historySortDirection === "asc" ? aIndex - bIndex : bIndex - aIndex;
                          } else if (historySortField === "revenue") {
                            return historySortDirection === "asc" ? a.revenue - b.revenue : b.revenue - a.revenue;
                          } else {
                            return historySortDirection === "asc" 
                              ? a.topProduct.localeCompare(b.topProduct) 
                              : b.topProduct.localeCompare(a.topProduct);
                          }
                        })
                        .map((month, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-4 text-sm font-medium">
                            {month.month}/{month.year}
                          </td>
                          <td className="py-4 text-sm">
                            {month.sales} pedidos
                          </td>
                          <td className="py-4 text-sm font-medium">
                            {`R$ ${(month.revenue / 100).toFixed(2).replace('.', ',')}`}
                          </td>
                          <td className="py-4 text-sm">
                            {month.topProduct}
                          </td>
                          <td className="py-4 text-sm">
                            <Badge variant="outline" className="bg-gray-100">
                              {month.topCategory}
                            </Badge>
                          </td>
                          <td className="py-4 text-sm">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                setSelectedOrder({
                                  id: month.completedOrders[0].id,
                                  customer: month.completedOrders[0].customer,
                                  date: month.completedOrders[0].date,
                                  status: "completed",
                                  email: "cliente@exemplo.com",
                                  phone: "83 99999-9999",
                                  total: month.completedOrders[0].total,
                                  items: [
                                    { productId: 1, productName: month.topProduct, quantity: 1, price: month.completedOrders[0].total }
                                  ]
                                });
                                setIsOrderDetailsOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Pedidos Finalizados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                        <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                        <th className="py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_SALES_HISTORY.flatMap(month => month.completedOrders)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 10)
                        .map((order, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-3 text-sm font-medium">{order.id}</td>
                            <td className="py-3 text-sm">{new Date(order.date).toLocaleDateString('pt-BR')}</td>
                            <td className="py-3 text-sm">{order.customer}</td>
                            <td className="py-3 text-sm text-right font-medium">{`R$ ${(order.total / 100).toFixed(2).replace('.', ',')}`}</td>
                            <td className="py-3 text-sm text-center">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setSelectedOrder({
                                    id: order.id,
                                    customer: order.customer,
                                    date: order.date,
                                    status: "completed",
                                    email: "cliente@exemplo.com",
                                    phone: "83 99999-9999",
                                    total: order.total,
                                    items: [
                                      { productId: 1, productName: "Produto do pedido", quantity: 1, price: order.total }
                                    ]
                                  });
                                  setIsOrderDetailsOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Product Dialog */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Produto</DialogTitle>
          </DialogHeader>
          <ProductForm onSubmit={handleAddProduct} />

          {/* Botões de navegação dentro do modal */}
          <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 flex flex-col gap-2">
            <Button 
              onClick={() => {
                const modal = document.querySelector('div[role="dialog"]');
                if (modal) modal.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              size="icon" 
              variant="secondary"
              className="h-8 w-8 rounded-full shadow-md"
              aria-label="Rolar para o topo do formulário"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
            </Button>
            <Button 
              onClick={() => {
                const modal = document.querySelector('div[role="dialog"]');
                if (modal) modal.scrollTo({ top: modal.scrollHeight, behavior: 'smooth' });
              }} 
              size="icon" 
              variant="secondary"
              className="h-8 w-8 rounded-full shadow-md"
              aria-label="Rolar para o final do formulário"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <ProductForm 
              onSubmit={handleEditProduct} 
              initialData={selectedProduct} 
            />
          )}
          
          {/* Botões de navegação dentro do modal */}
          <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 flex flex-col gap-2">
            <Button 
              onClick={() => {
                const modal = document.querySelector('div[role="dialog"]');
                if (modal) modal.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              size="icon" 
              variant="secondary"
              className="h-8 w-8 rounded-full shadow-md"
              aria-label="Rolar para o topo do formulário"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
            </Button>
            <Button 
              onClick={() => {
                const modal = document.querySelector('div[role="dialog"]');
                if (modal) modal.scrollTo({ top: modal.scrollHeight, behavior: 'smooth' });
              }} 
              size="icon" 
              variant="secondary"
              className="h-8 w-8 rounded-full shadow-md"
              aria-label="Rolar para o final do formulário"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </Button>
          </div>
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
      
      {/* Ajuste de Estoque */}
      <Dialog open={isAdjustStockOpen} onOpenChange={setIsAdjustStockOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {stockAction === 'add' ? 'Adicionar ao Estoque' : 'Remover do Estoque'}
            </DialogTitle>
            <DialogDescription>
              {stockAction === 'add' 
                ? 'Adicione produtos ao estoque (por exemplo, recebimento de produtos)' 
                : 'Remova produtos do estoque (por exemplo, produtos danificados)'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <StockAdjustmentForm
              product={selectedProduct}
              stockAction={stockAction}
              onSubmit={handleAdjustStock}
              onCancel={() => setIsAdjustStockOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para visualizar detalhes do pedido */}
      <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              {selectedOrder && new Date(selectedOrder.date).toLocaleDateString('pt-BR')}
            </DialogDescription>
          </DialogHeader>
          

          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Informações do Cliente</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm"><span className="font-medium">Nome:</span> {selectedOrder.customer}</p>
                    <p className="text-sm"><span className="font-medium">Email:</span> {selectedOrder.email}</p>
                    <p className="text-sm"><span className="font-medium">Telefone:</span> {selectedOrder.phone}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Informações do Pedido</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm">
                      <span className="font-medium">Status:</span>{" "}
                      {selectedOrder.status === 'pending' ? (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          Pendente
                        </Badge>
                      ) : selectedOrder.status === 'completed' ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Concluído
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Cancelado
                        </Badge>
                      )}
                    </p>
                    <p className="text-sm"><span className="font-medium">Total:</span> {`R$ ${(selectedOrder.total / 100).toFixed(2).replace('.', ',')}`}</p>
                    <p className="text-sm"><span className="font-medium">Itens:</span> {selectedOrder.items.reduce((acc: number, item: any) => acc + item.quantity, 0)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Produtos</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                        <th className="py-2 text-center text-xs font-medium text-gray-500 uppercase">Preço</th>
                        <th className="py-2 text-center text-xs font-medium text-gray-500 uppercase">Qtd</th>
                        <th className="py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item: any, index: number) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 text-sm">{item.productName}</td>
                          <td className="py-3 text-sm text-center">{`R$ ${(item.price / 100).toFixed(2).replace('.', ',')}`}</td>
                          <td className="py-3 text-sm text-center">{item.quantity}</td>
                          <td className="py-3 text-sm text-right font-medium">{`R$ ${((item.price * item.quantity) / 100).toFixed(2).replace('.', ',')}`}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50">
                        <td colSpan={3} className="py-3 text-sm text-right font-bold">Total</td>
                        <td className="py-3 text-sm text-right font-bold">{`R$ ${(selectedOrder.total / 100).toFixed(2).replace('.', ',')}`}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between">
            {selectedOrder && selectedOrder.status === 'pending' && (
              <div className="flex gap-2">
                <Button variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                  <Check className="mr-2 h-4 w-4" />
                  Aprovar Pedido
                </Button>
                <Button variant="outline" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
                  <X className="mr-2 h-4 w-4" />
                  Cancelar Pedido
                </Button>
              </div>
            )}
            <Button variant="outline" onClick={() => setIsOrderDetailsOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal para adicionar venda */}
      <Dialog open={isAddSaleOpen} onOpenChange={setIsAddSaleOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Nova Venda</DialogTitle>
            <DialogDescription>
              Adicione os detalhes da venda para registrar no sistema.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Nome do Cliente</Label>
                <Input id="customer" placeholder="Nome completo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@exemplo.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" placeholder="(00) 00000-0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data da Venda</Label>
                <Input id="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <div className="flex justify-between items-center">
                <Label>Produtos</Label>
                <Button variant="outline" type="button" size="sm" className="h-8">
                  <Plus className="h-4 w-4 mr-1" /> Adicionar Produto
                </Button>
              </div>
              
              <div className="border rounded-md">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                        <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase">Preço</th>
                        <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase">Qtd</th>
                        <th className="p-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                        <th className="p-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {products && products.slice(0, 2).map((product, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 text-sm">{product.name}</td>
                          <td className="p-2 text-sm text-center">{product.formattedPrice}</td>
                          <td className="p-2 text-center">
                            <Input 
                              type="number" 
                              defaultValue="1" 
                              min="1" 
                              className="h-8 w-16 text-center mx-auto"
                            />
                          </td>
                          <td className="p-2 text-sm text-right">{product.formattedPrice}</td>
                          <td className="p-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-muted/50">
                        <td colSpan={3} className="p-2 text-sm text-right font-medium">Total</td>
                        <td className="p-2 text-sm text-right font-bold">
                          {products && `R$ ${(products.slice(0, 2).reduce((acc, product) => {
                            return acc + product.price;
                          }, 0) / 100).toFixed(2).replace('.', ',')}`}
                        </td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" placeholder="Observações adicionais sobre a venda..." />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSaleOpen(false)}>Cancelar</Button>
            <Button onClick={() => {
              toast({
                title: "Venda registrada com sucesso!",
                description: "A venda foi adicionada ao sistema.",
              });
              setIsAddSaleOpen(false);
            }}>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Registrar Venda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Componente de formulário para ajuste de estoque
interface StockAdjustmentFormProps {
  product: DisplayProduct;
  stockAction: "add" | "remove" | null;
  onSubmit: (data: { quantity: number; notes: string }) => void;
  onCancel: () => void;
}

const stockAdjustmentSchema = z.object({
  quantity: z.number().min(1, "A quantidade deve ser pelo menos 1"),
  notes: z.string().optional(),
});

const StockAdjustmentForm = ({ product, stockAction, onSubmit, onCancel }: StockAdjustmentFormProps) => {
  const form = useForm<z.infer<typeof stockAdjustmentSchema>>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      quantity: 1,
      notes: "",
    },
  });

  const handleSubmit = (data: z.infer<typeof stockAdjustmentSchema>) => {
    onSubmit({
      quantity: data.quantity,
      notes: data.notes || "",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-md">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="h-16 w-16 rounded-md object-cover"
          />
          <div>
            <h3 className="font-medium">{product.name}</h3>
            <p className="text-sm text-gray-500">
              Estoque atual: <span className="font-semibold">{product.stock}</span>
            </p>
            {product.sku && (
              <p className="text-xs text-gray-500">SKU: {product.sku}</p>
            )}
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  value={field.value}
                  onChange={e => field.onChange(parseInt(e.target.value || "0", 10))}
                  min={1}
                  max={stockAction === "remove" ? product.stock : undefined}
                />
              </FormControl>
              <FormDescription>
                {stockAction === "add" 
                  ? "Quantidade a ser adicionada ao estoque" 
                  : "Quantidade a ser removida do estoque"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder={stockAction === "add" 
                    ? "Ex: Recebimento de fornecedor" 
                    : "Ex: Produtos danificados"
                  }
                  rows={3}
                />
              </FormControl>
              <FormDescription>
                Informações adicionais sobre este ajuste de estoque
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            type="submit"
            className={stockAction === "add" 
              ? "bg-green-600 hover:bg-green-700" 
              : "bg-red-600 hover:bg-red-700"
            }
          >
            {stockAction === "add" 
              ? <PlusCircle className="h-4 w-4 mr-2" /> 
              : <MinusCircle className="h-4 w-4 mr-2" />
            }
            {stockAction === "add" ? "Adicionar ao Estoque" : "Remover do Estoque"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default AdminPanel;
