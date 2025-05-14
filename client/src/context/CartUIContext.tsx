import { createContext, ReactNode, useContext, useState } from 'react';

interface CartUIContextType {
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartUIContext = createContext<CartUIContextType | undefined>(undefined);

interface CartUIProviderProps {
  children: ReactNode;
}

export function CartUIProvider({ children }: CartUIProviderProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Funções para manipular o estado do carrinho
  const openCart = () => {
    console.log("[CartUIContext] Abrindo carrinho");
    setIsCartOpen(true);
  };
  
  const closeCart = () => {
    console.log("[CartUIContext] Fechando carrinho");
    setIsCartOpen(false);
  };
  
  const toggleCart = () => {
    console.log("[CartUIContext] Alterando estado do carrinho");
    setIsCartOpen(prev => !prev);
  };

  return (
    <CartUIContext.Provider value={{ isCartOpen, openCart, closeCart, toggleCart }}>
      {children}
    </CartUIContext.Provider>
  );
}

export function useCartUI() {
  const context = useContext(CartUIContext);
  
  if (context === undefined) {
    throw new Error('useCartUI must be used within a CartUIProvider');
  }
  
  return context;
}