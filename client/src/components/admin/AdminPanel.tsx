import { useState, useMemo, useEffect } from "react";
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
  Users,
  Tag
} from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import ProductForm from "./ProductForm";
import { DisplayProduct } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { StockAdjustmentForm } from "./StockAdjustmentForm";
import CategoryManager from "./CategoryManager";
import BrandManager from "./BrandManager";
import { useQueryClient } from "@tanstack/react-query";

// Tipos para o sistema de vendas
type Order = {
  id: number;
  customer: string;
  email: string;
  phone: string;
  date: string;
  status: "pending" | "completed" | "cancelled";
  total: number;
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    price: number;
  }>;
};

type SalesHistoryMonth = {
  month: string;
  year: number;
  sales: number;
  revenue: number;
  topProduct: string;
  topCategory: string;
  topBrand: string;
  completedOrders: Array<{
    id: number;
    date: string;
    customer: string;
    total: number;
  }>;
};

// Estado inicial para histórico de vendas - apenas dados reais serão mostrados
const SALES_HISTORY: SalesHistoryMonth[] = [];

const AdminPanel = () => {
  const { user, logout, isLoggingOut } = useAdmin();
  const { toast } = useToast();

  // Estados para controlar os modais
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DisplayProduct | null>(null);

  // Estados para controlar as abas
  const [activeTab, setActiveTab] = useState("products");

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isViewProductOpen, setIsViewProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<DisplayProduct | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdjustStockOpen, setIsAdjustStockOpen] = useState(false);
  const [stockAction, setStockAction] = useState<"add" | "remove" | null>(null);
  
  // Estado para vendas reais
  const [realOrders, setRealOrders] = useState<Order[]>([]);
  const [realSalesHistory, setRealSalesHistory] = useState<SalesHistoryMonth[]>(SALES_HISTORY);
  
  const { data: products, isLoading, error, refetch } = useQuery<DisplayProduct[]>({
    queryKey: ["/api/products"],
  });

  const { data: adminProducts } = useQuery<DisplayProduct[]>({
    queryKey: ["/api/products/admin"],
  });
  
  const filteredProducts = products?.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Estados para as novas funcionalidades de vendas e histórico
  const [salesSearchTerm, setSalesSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [isAddSaleOpen, setIsAddSaleOpen] = useState(false);
  const [isProductSelectionOpen, setIsProductSelectionOpen] = useState(false);
  const [historySortField, setHistorySortField] = useState("month");
  const [historySortDirection, setHistorySortDirection] = useState<"asc" | "desc">("desc");
  const [saleProducts, setSaleProducts] = useState<Array<{ product: DisplayProduct; quantity: number }>>([]);
  
  // Inicializar produtos quando o modal de adicionar venda é aberto
  useEffect(() => {
    // Limpar produtos quando o modal for fechado
    if (!isAddSaleOpen) {
      setSaleProducts([]);
    }
  }, [isAddSaleOpen]);
  
  // Função para remover produto da venda
  const removeProductFromSale = (index: number) => {
    setSaleProducts(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "Produto removido",
      description: "O produto foi removido da venda.",
    });
  };
  
  // Função para adicionar produto à venda
  const addProductToSale = () => {
    setIsProductSelectionOpen(true);
  };

  // Função para selecionar produto do modal
  const selectProductForSale = (product: DisplayProduct) => {
    setSaleProducts(prev => [...prev, { product, quantity: 1 }]);
    setIsProductSelectionOpen(false);
  };
  
  // Função para atualizar a quantidade de um produto
  const updateProductQuantity = (index: number, quantity: number) => {
    setSaleProducts(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };
  
  // Função para registrar uma nova venda
  const handleAddSale = (saleData: any) => {
    try {
      const newOrder = {
        id: Date.now(), // ID único baseado em timestamp
        customer: saleData.customer,
        email: saleData.email,
        phone: saleData.phone,
        date: saleData.date,
        status: "completed" as const,
        total: saleProducts.reduce((acc, item) => acc + (item.product.price * item.quantity), 0),
        items: saleProducts.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        }))
      };

      // Adicionar ao estado de pedidos reais
      setRealOrders(prev => [newOrder, ...prev]);
      
      // Atualizar histórico de vendas
      const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
                         "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
      const saleDate = new Date(saleData.date);
      const monthYear = `${monthNames[saleDate.getMonth()]} ${saleDate.getFullYear()}`;
      
      setRealSalesHistory(prev => {
        const existingMonth = prev.find(month => `${month.month} ${month.year}` === monthYear);
        
        if (existingMonth) {
          // Atualizar mês existente
          return prev.map(month => 
            `${month.month} ${month.year}` === monthYear 
              ? {
                  ...month,
                  sales: month.sales + 1,
                  revenue: month.revenue + newOrder.total,
                  completedOrders: [...month.completedOrders, {
                    id: newOrder.id,
                    date: newOrder.date,
                    customer: newOrder.customer,
                    total: newOrder.total
                  }]
                }
              : month
          );
        } else {
          // Criar novo mês
          return [...prev, {
            month: monthNames[saleDate.getMonth()],
            year: saleDate.getFullYear(),
            sales: 1,
            revenue: newOrder.total,
            topProduct: saleProducts[0]?.product.name || "N/A",
            topCategory: saleProducts[0]?.product.category || "N/A",
            topBrand: saleProducts[0]?.product.brand || "N/A",
            completedOrders: [{
              id: newOrder.id,
              date: newOrder.date,
              customer: newOrder.customer,
              total: newOrder.total
            }]
          }];
        }
      });
      
      toast({
        title: "Venda registrada com sucesso!",
        description: `Venda para ${saleData.customer} foi adicionada ao sistema.`,
      });
      
      setIsAddSaleOpen(false);
      setSaleProducts([]); // Limpar produtos da venda
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao registrar a venda. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const queryClient = useQueryClient();

  const handleAddProduct = async (data: any) => {
    // Verificar se o usuário está autenticado
    if (!user?.isAdmin) {
      toast({
        title: "Acesso Negado",
        description: "Você precisa estar logado como administrador.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Tentando adicionar produto:", data);
      
      // Usando apiRequest para enviar credenciais corretamente
      const response = await apiRequest("POST", "/api/products", data);
      const newProduct = await response.json();
      
      setIsAddProductOpen(false);
      
      // Invalidar e refazer a query para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      
      toast({
        title: "Sucesso",
        description: "Produto adicionado com sucesso!",
      });
    } catch (error: any) {
      console.error("Erro ao adicionar produto:", error);
      
      // Removida verificação de sessão expirada - não há mais logout automático
      
      let errorMessage = "Erro ao adicionar produto. Tente novamente.";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = async (data: any) => {
    if (!selectedProduct) return;
    
    // Verificar se o usuário está autenticado
    if (!user?.isAdmin) {
      toast({
        title: "Acesso Negado",
        description: "Você precisa estar logado como administrador.",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Editando produto:", selectedProduct.id, data);
    
    try {
      const response = await apiRequest("PUT", `/api/products/${selectedProduct.id}`, data);
      const updatedProduct = await response.json();
      
      console.log("Produto atualizado com sucesso:", updatedProduct);
      
      setIsEditProductOpen(false);
      
      // Invalidar e refazer a query para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      
      // Removida verificação de sessão expirada - não há mais logout automático
      
      toast({
        title: "Erro",
        description: "Erro ao atualizar produto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    
    // Verificar se o usuário está autenticado
    if (!user?.isAdmin) {
      toast({
        title: "Acesso Negado",
        description: "Você precisa estar logado como administrador.",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Deletando produto:", selectedProduct.id);
    
    try {
      const response = await apiRequest("DELETE", `/api/products/${selectedProduct.id}`);
      
      console.log("Produto deletado com sucesso, status:", response.status);
      
      setIsDeleteConfirmOpen(false);
      
      // Invalidar e refazer a query para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      
      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      
      // Removida verificação de sessão expirada - não há mais logout automático
      
      toast({
        title: "Erro",
        description: "Erro ao excluir produto. Tente novamente.",
        variant: "destructive",
      });
    }
  };
  
  const handleAdjustStock = async (data: { quantity: number, notes: string }) => {
    if (!selectedProduct) return;

    try {
      const newStock = stockAction === 'add' 
        ? (selectedProduct.stock || 0) + data.quantity
        : Math.max(0, (selectedProduct.stock || 0) - data.quantity);

      await apiRequest("POST", "/api/inventory/update-stock", {
        productId: selectedProduct.id,
        stockChange: Math.abs(data.quantity),
        transactionType: stockAction === 'add' ? "purchase" : "adjustment",
        notes: data.notes || ""
      });
      
      toast({
        title: "Estoque atualizado",
        description: `Estoque do produto "${selectedProduct.name}" foi ${stockAction === 'add' ? 'adicionado' : 'removido'} com sucesso.`,
      });

      setIsAdjustStockOpen(false);
      
      // Invalidar e refazer a query para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    } catch (error) {
      console.error('Erro ao ajustar estoque:', error);
      toast({
        title: "Erro",
        description: "Erro ao ajustar o estoque. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 md:p-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold font-montserrat">Painel Administrativo</h1>
          <p className="text-gray-500">Bem-vindo, {user?.username || 'Administrador'}</p>
        </div>
        <Button onClick={logout} variant="outline" disabled={isLoggingOut}>
          {isLoggingOut ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saindo...
            </>
          ) : (
            <>
          <LogOut className="mr-2 h-4 w-4" /> Sair
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-7 md:w-[1050px] mb-6">
          <TabsTrigger value="overview">
            <LayoutDashboard className="mr-2 h-4 w-4" /> Visão Geral
          </TabsTrigger>
          <TabsTrigger value="products">
            <Package className="mr-2 h-4 w-4" /> Produtos
          </TabsTrigger>
          <TabsTrigger value="categories">
            <Tag className="mr-2 h-4 w-4" /> Categorias
          </TabsTrigger>
          <TabsTrigger value="brands">
            <Tag className="mr-2 h-4 w-4" /> Marcas
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
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-700">
                  <BarChart3 className="h-4 w-4 inline-block mr-2" />
                  Receita Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">
                  {`R$ ${(realSalesHistory.reduce((acc, month) => acc + month.revenue, 0) / 100).toFixed(2).replace('.', ',')}`}
                </div>
                <p className="text-xs text-green-700 mt-1">
                  Vendas confirmadas no período
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
                  {realSalesHistory.reduce((acc, month) => acc + month.sales, 0)}
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  Pedidos finalizados
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">
                  <Package className="h-4 w-4 inline-block mr-2" />
                  Ticket Médio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-700">
                  {realSalesHistory.length > 0 
                    ? `R$ ${((realSalesHistory.reduce((acc, month) => acc + month.revenue, 0) / 
                       realSalesHistory.reduce((acc, month) => acc + month.sales, 0)) / 100).toFixed(2).replace('.', ',')}`
                    : "R$ 0,00"
                  }
                </div>
                <p className="text-xs text-purple-700 mt-1">
                  Valor médio por venda
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Configurações do Sistema</CardTitle>
              <CardDescription>Ferramentas para gerenciar o inventário e dados do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Funcionalidades de configuração do sistema removidas */}
            </CardContent>
          </Card>
          
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
                  {products?.filter(p => p.stock <= (p.lowStockThreshold || 10)).length || 0}
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
                  {products?.filter(p => p.stock <= 0).length || 0}
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
              <CardTitle>Gerenciamento de Estoque - Todos os Produtos</CardTitle>
              <CardDescription>Visualize e gerencie o estoque de todos os produtos cadastrados</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
              ) : products && products.length > 0 ? (
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
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="h-10 w-10 rounded-md object-cover mr-3"
                              />
                              <div>
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {product.category}
                                </div>
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
                              {product.stock || 0}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {product.lowStockThreshold || 10}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {product.formattedPrice}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {(product.stock || 0) <= 0 ? (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                Esgotado
                              </Badge>
                            ) : (product.stock || 0) <= (product.lowStockThreshold || 10) ? (
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
                                disabled={(product.stock || 0) <= 0}
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
                  Nenhum produto cadastrado no sistema.
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
                  <Input
                    type="search"
                    placeholder="Buscar produtos..."
                    className="w-full md:w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
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

        {/* Aba de Categorias */}
        <TabsContent value="categories">
          <CategoryManager />
        </TabsContent>

        {/* Aba de Marcas */}
        <TabsContent value="brands">
          <BrandManager />
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
                  <Input
                    placeholder="Buscar por cliente, email, telefone..."
                    className="w-full"
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
                      {realOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-gray-500">
                            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium mb-2">Nenhuma venda registrada</p>
                            <p className="text-sm">As vendas adicionadas aparecerão aqui</p>
                            <Button 
                              onClick={() => setIsAddSaleOpen(true)} 
                              className="mt-4 bg-accent hover:bg-accent/90"
                            >
                              <Plus className="mr-2 h-4 w-4" /> Adicionar Primeira Venda
                            </Button>
                          </td>
                        </tr>
                      ) : (
                        realOrders.map((order) => (
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
                        ))
                      )}
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
                    {`R$ ${(realSalesHistory.reduce((acc, month) => acc + month.revenue, 0) / 100).toFixed(2).replace('.', ',')}`}
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
                    {realSalesHistory.reduce((acc, month) => acc + month.sales, 0)}
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
                    {`R$ ${((realSalesHistory.reduce((acc, month) => acc + month.revenue, 0) / 
                      realSalesHistory.reduce((acc, month) => acc + month.sales, 0)) / 100).toFixed(2).replace('.', ',')}`}
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
                      {realSalesHistory.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-gray-500">
                            <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium mb-2">Nenhum histórico de vendas</p>
                            <p className="text-sm">O histórico será gerado conforme as vendas forem realizadas</p>
                          </td>
                        </tr>
                      ) : (
                        realSalesHistory
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
                                  id: month.completedOrders[0]?.id || 0,
                                  customer: month.completedOrders[0]?.customer || "Cliente",
                                  date: month.completedOrders[0]?.date || new Date().toISOString(),
                                  status: "completed",
                                  email: "cliente@exemplo.com",
                                  phone: "83 99999-9999",
                                  total: month.completedOrders[0]?.total || 0,
                                  items: [
                                    { productId: 1, productName: month.topProduct, quantity: 1, price: month.completedOrders[0]?.total || 0 }
                                  ]
                                });
                                setIsOrderDetailsOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      )))}
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
                      {realSalesHistory.flatMap(month => month.completedOrders).length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-gray-500">
                            <ClipboardCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium mb-2">Nenhum pedido finalizado</p>
                            <p className="text-sm">Os pedidos concluídos aparecerão aqui</p>
                          </td>
                        </tr>
                      ) : (
                        realSalesHistory.flatMap(month => month.completedOrders)
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
                      )}
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
                          <td className="py-3 text-sm text-right font-medium">
                            {`R$ ${((item.price * item.quantity) / 100).toFixed(2).replace('.', ',')}`}
                          </td>
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
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const saleData = {
              customer: formData.get('customer') as string,
              email: formData.get('email') as string,
              phone: formData.get('phone') as string,
              date: formData.get('date') as string,
              notes: formData.get('notes') as string
            };
            // Validar dados obrigatórios
            if (!saleData.customer || !saleData.phone || saleProducts.length === 0) {
              toast({
                title: "Dados incompletos",
                description: "Preencha todos os campos obrigatórios e adicione pelo menos um produto.",
                variant: "destructive",
              });
              return;
            }
            handleAddSale(saleData);
          }}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Nome do Cliente *</Label>
                <Input id="customer" name="customer" placeholder="Nome completo" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="email@exemplo.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input id="phone" name="phone" placeholder="(00) 00000-0000" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data da Venda *</Label>
                <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <div className="flex justify-between items-center">
                <Label>Produtos *</Label>
                <Button 
                  variant="outline" 
                  type="button" 
                  size="sm" 
                  className="h-8"
                  onClick={addProductToSale}
                >
                  <Plus className="h-4 w-4 mr-1" /> Selecionar Produto
                </Button>
              </div>
              
              
                {saleProducts.length === 0 ? (
                  <div className="border rounded-md p-8 text-center text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Nenhum produto adicionado à venda</p>
                    <p className="text-sm">Clique em "Selecionar Produto" para começar</p>
                  </div>
                ) : (
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
                      {saleProducts.map((item, index) => (
                        <tr key={index} className="border-b">
                              <td className="p-2">
                                <div className="flex items-center space-x-2">
                                  <img 
                                    src={item.product.imageUrl} 
                                    alt={item.product.name}
                                    className="h-8 w-8 rounded object-cover"
                                  />
                                  <span className="text-sm font-medium">{item.product.name}</span>
                                </div>
                              </td>
                          <td className="p-2 text-sm text-center">{item.product.formattedPrice}</td>
                          <td className="p-2 text-center">
                            <Input 
                              type="number" 
                              value={item.quantity}
                              min="1" 
                              className="h-8 w-16 text-center mx-auto"
                              onChange={(e) => updateProductQuantity(index, parseInt(e.target.value) || 1)}
                            />
                          </td>
                              <td className="p-2 text-sm text-right font-medium">
                            {`R$ ${((item.product.price * item.quantity) / 100).toFixed(2).replace('.', ',')}`}
                          </td>
                          <td className="p-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                                  type="button"
                              className="h-8 w-8 p-0"
                              onClick={() => removeProductFromSale(index)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-muted/50">
                        <td colSpan={3} className="p-2 text-sm text-right font-medium">Total</td>
                            <td className="p-2 text-sm text-right font-bold text-lg">
                          {`R$ ${(saleProducts.reduce((acc, item) => {
                            return acc + (item.product.price * item.quantity);
                          }, 0) / 100).toFixed(2).replace('.', ',')}`}
                        </td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
                )}
            </div>
            
            <div className="space-y-2 mt-4">
              <Label htmlFor="notes">Observações</Label>
                <Textarea id="notes" name="notes" placeholder="Observações adicionais sobre a venda..." />
            </div>
          </div>
          
          <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddSaleOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saleProducts.length === 0}>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Registrar Venda
            </Button>
          </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Modal de seleção de produtos para venda */}
      <Dialog open={isProductSelectionOpen} onOpenChange={setIsProductSelectionOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Selecionar Produto</DialogTitle>
            <DialogDescription>
              Selecione um produto criado pelo admin para adicionar à venda.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {adminProducts && adminProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => selectProductForSale(product)}
                  >
                    <div className="flex items-center space-x-3">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="h-12 w-12 rounded object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{product.name}</h3>
                        <p className="text-xs text-gray-500">{product.category}</p>
                        <p className="text-sm font-semibold text-green-600">{product.formattedPrice}</p>
                        <p className="text-xs text-gray-500">Estoque: {product.stock || 0}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Nenhum produto criado pelo admin encontrado.</p>
                <p className="text-sm">Crie produtos primeiro para poder adicioná-los às vendas.</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProductSelectionOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
          </div>
  );
};

export default AdminPanel;
