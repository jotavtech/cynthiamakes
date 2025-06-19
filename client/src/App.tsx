import { Switch, Route, useLocation } from "wouter";
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
import { useCart } from "@/hooks/useCart";
import { ShoppingBag } from "lucide-react";

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
  const { cartItems, isCartOpen, setIsCartOpen } = useCart();
  const [location] = useLocation();

  return (
    <TooltipProvider>
      <Header />
      
      <main className="min-h-screen">
        <Router />
      </main>
      
      {/* Botão flutuante do carrinho - escondido na área admin */}
      {location !== "/admin" && (
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 bg-accent text-white p-4 rounded-full shadow-xl hover:bg-accent-dark hover:scale-110 transition-all duration-300 z-40 flex items-center justify-center"
        aria-label="Abrir carrinho"
      >
        <ShoppingBag className="h-6 w-6" />
        {cartItems.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-6 h-6 flex items-center justify-center font-bold shadow-md animate-pulse">
            {cartItems.reduce((total, item) => total + item.quantity, 0)}
          </span>
        )}
      </button>
      )}
      
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      <Footer />
      <Toaster />
    </TooltipProvider>
  );
}

export default App;