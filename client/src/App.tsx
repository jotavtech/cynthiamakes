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
import { CartUIProvider, useCartUI } from "@/context/CartUIContext";

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

function AppContent() {
  const { isCartOpen, openCart, closeCart, toggleCart } = useCartUI();

  return (
    <TooltipProvider>
      <Header openCart={openCart} toggleCart={toggleCart} />
      
      <main className="min-h-screen">
        <Router />
      </main>
      
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
      
      <Footer />
      <Toaster />
    </TooltipProvider>
  );
}

function App() {
  return (
    <CartUIProvider>
      <AppContent />
    </CartUIProvider>
  );
}

export default App;
