import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import ProductsPage from "@/pages/ProductsPage";
import AdminPage from "@/pages/AdminPage";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/layout/CartDrawer";
import { useCart } from "@/hooks/useCart";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/produtos" component={ProductsPage} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { isCartOpen } = useCart();

  return (
    <TooltipProvider>
      <Header />
      
      <main className="min-h-screen">
        <Router />
      </main>
      
      {isCartOpen && <CartDrawer />}
      
      <Footer />
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
