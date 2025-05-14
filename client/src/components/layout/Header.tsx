import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Search, 
  ShoppingBag, 
  Menu, 
  X,
  Settings
} from "lucide-react";
import { useCart } from "@/hooks/useCart";

const Header = () => {
  const [location] = useLocation();
  const { cartItems, toggleCart } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const navLinks = [
    { name: "Início", path: "/" },
    { name: "Produtos", path: "/produtos" },
    { name: "Sobre", path: "/sobre" },
    { name: "Contato", path: "/contato" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold font-montserrat">
              <span className="text-accent">CYNTHIA</span>
              <span className="text-primary">MAKEUP</span>
            </h1>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.path} 
                className={`font-medium ${
                  location === link.path ? "text-accent" : "text-primary"
                } hover:text-accent transition`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Search, Cart, Menu Icons */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleSearch}
              className="p-2 hover:text-accent transition"
              aria-label="Search"
            >
              <Search className="h-6 w-6" />
            </button>
            
            <Link 
              href="/carrinho"
              className="p-2 hover:text-accent transition relative"
              aria-label="Shopping cart"
            >
              <ShoppingBag className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            
            <Link 
              href="/admin" 
              className="p-2 hover:text-accent transition hidden md:block"
              aria-label="Admin area"
            >
              <Settings className="h-6 w-6" />
            </Link>
            
            <button 
              onClick={toggleMobileMenu}
              className="p-2 md:hidden hover:text-accent transition"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.path} 
                className={`block py-2 font-medium ${
                  location === link.path ? "text-accent" : "text-primary"
                } hover:text-accent transition`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Search Bar */}
      {isSearchOpen && (
        <div className="bg-light border-t">
          <div className="container mx-auto px-4 py-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Buscar produtos..." 
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label="Search products"
              />
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
