import { 
  createContext, 
  useState, 
  useEffect, 
  ReactNode 
} from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { generateSessionId } from "@/lib/utils";
import { CartItemWithProduct } from "@shared/schema";

interface CartContextType {
  cartItems: CartItemWithProduct[];
  isCartOpen: boolean;
  isLoading: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateCartItemQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleCart: () => void;
}

export const CartContext = createContext<CartContextType>({
  cartItems: [],
  isCartOpen: false,
  isLoading: false,
  addToCart: async () => {},
  updateCartItemQuantity: async () => {},
  removeFromCart: async () => {},
  clearCart: async () => {},
  toggleCart: () => {},
});

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string>("");
  const { toast } = useToast();

  // Initialize session ID
  useEffect(() => {
    console.log("Initializing session ID");
    const storedSessionId = localStorage.getItem("cartSessionId");
    if (storedSessionId) {
      console.log("Using existing session ID:", storedSessionId);
      setSessionId(storedSessionId);
    } else {
      const newSessionId = generateSessionId();
      console.log("Created new session ID:", newSessionId);
      localStorage.setItem("cartSessionId", newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  // Fetch cart items when session ID is available
  useEffect(() => {
    if (sessionId) {
      console.log("Session ID is available, fetching cart items:", sessionId);
      fetchCartItems();
    }
  }, [sessionId]);

  const fetchCartItems = async () => {
    if (!sessionId) {
      console.log("No session ID available, can't fetch cart items");
      return;
    }
    
    console.log("Fetching cart items for session:", sessionId);
    setIsLoading(true);
    try {
      // Usar apiRequest para garantir que estamos enviando cookies e headers corretos
      const response = await fetch(`/api/cart/${sessionId}`);
      if (!response.ok) {
        console.error("Failed to fetch cart:", response.status, response.statusText);
        throw new Error("Failed to fetch cart");
      }
      
      const data = await response.json();
      console.log("Cart items fetched:", data);
      setCartItems(data);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os itens do carrinho.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (productId: number, quantity = 1) => {
    if (!sessionId) {
      console.error("No session ID available, can't add to cart");
      return;
    }
    
    console.log(`Adding product ${productId} to cart with quantity ${quantity}`);
    
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity,
          sessionId,
        }),
      });
      
      if (!response.ok) {
        console.error("Failed to add to cart:", response.status, response.statusText);
        throw new Error("Failed to add to cart");
      }
      
      const result = await response.json();
      console.log("Product added to cart:", result);
      
      // Fetch updated cart items
      await fetchCartItems();
      
      // Depois de adicionar o produto, talvez abrir o carrinho automaticamente
      setIsCartOpen(true);
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  };

  const updateCartItemQuantity = async (cartItemId: number, quantity: number) => {
    if (!sessionId) return;
    
    try {
      await apiRequest("PUT", `/api/cart/${cartItemId}`, { quantity });
      await fetchCartItems();
    } catch (error) {
      console.error("Error updating cart item:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o item do carrinho.",
        variant: "destructive",
      });
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    if (!sessionId) return;
    
    try {
      await apiRequest("DELETE", `/api/cart/${cartItemId}`);
      await fetchCartItems();
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o item do carrinho.",
        variant: "destructive",
      });
    }
  };

  const clearCart = async () => {
    if (!sessionId) return;
    
    try {
      await apiRequest("DELETE", `/api/cart/clear/${sessionId}`);
      setCartItems([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast({
        title: "Erro",
        description: "Não foi possível limpar o carrinho.",
        variant: "destructive",
      });
    }
  };

  const toggleCart = () => {
    console.log("Toggling cart from", isCartOpen, "to", !isCartOpen);
    setIsCartOpen(!isCartOpen);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        isLoading,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
