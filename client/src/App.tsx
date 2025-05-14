import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import ProductsPage from "@/pages/ProductsPage";
import AdminPage from "@/pages/AdminPage";
import SobrePage from "@/pages/SobrePage";
import ContatoPage from "@/pages/ContatoPage";
import CartPage from "@/pages/CartPage";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/layout/CartDrawer";
import { useState, useEffect, createContext } from "react";
import { CartItemWithProduct } from "@shared/schema";
import { ShoppingBag } from "lucide-react";

// Criar contexto para o carrinho
export const CartContext = createContext<{
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  cartItems: CartItemWithProduct[];
  refreshCart: () => Promise<void>;
}>({
  isCartOpen: false,
  openCart: () => {},
  closeCart: () => {},
  cartItems: [],
  refreshCart: async () => {},
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/produtos" component={ProductsPage} />
      <Route path="/sobre" component={SobrePage} />
      <Route path="/contato" component={ContatoPage} />
      <Route path="/carrinho" component={CartPage} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Estado do carrinho
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  
  // ID de sessão fixo
  const sessionId = '99i47ng8zigy94xt079q59';
  
  // Função para buscar itens do carrinho
  const refreshCart = async () => {
    try {
      console.log("[App] Buscando itens do carrinho...");
      const response = await fetch(`/api/cart/${sessionId}`);
      if (!response.ok) throw new Error("Falha ao buscar carrinho");
      
      const data = await response.json();
      console.log("[App] Itens recebidos:", data);
      setCartItems(data);
    } catch (error) {
      console.error("[App] Erro ao buscar itens:", error);
    }
  };
  
  // Buscar itens do carrinho na montagem do componente
  useEffect(() => {
    refreshCart();
  }, []);
  
  // Buscar itens quando o carrinho é aberto
  useEffect(() => {
    if (isCartOpen) {
      refreshCart();
    }
  }, [isCartOpen]);
  
  // Funções do carrinho
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider value={{ 
      isCartOpen, 
      openCart, 
      closeCart, 
      cartItems,
      refreshCart
    }}>
      <TooltipProvider>
        <Header />
        
        <main className="min-h-screen">
          <Router />
        </main>
        
        {/* Botão flutuante do carrinho */}
        <button
          onClick={openCart}
          className="fixed bottom-6 right-6 bg-accent text-white p-4 rounded-full shadow-lg hover:bg-opacity-90 transition-all z-40 flex items-center justify-center"
          aria-label="Abrir carrinho"
        >
          <ShoppingBag className="h-6 w-6" />
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-6 h-6 flex items-center justify-center font-bold">
              {cartItems.reduce((total, item) => total + item.quantity, 0)}
            </span>
          )}
        </button>
        
        <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
        
        <Footer />
        <Toaster />
      </TooltipProvider>
    </CartContext.Provider>
  );
}

export default App;