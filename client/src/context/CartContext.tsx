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
    
    try {
      // Verificar se existe uma sessão no localStorage
      let storedSessionId = localStorage.getItem("cartSessionId");
      
      // Verificar se o ID já existe e é válido
      if (storedSessionId && storedSessionId.length > 10) {
        console.log("Usando ID de sessão existente:", storedSessionId);
        setSessionId(storedSessionId);
      } else {
        // Gerar um novo ID de sessão
        const newSessionId = generateSessionId();
        console.log("Criando novo ID de sessão:", newSessionId);
        
        // Salvar no localStorage
        try {
          localStorage.setItem("cartSessionId", newSessionId);
          console.log("ID de sessão salvo no localStorage");
        } catch (storageError) {
          console.error("Erro ao salvar ID de sessão no localStorage:", storageError);
        }
        
        setSessionId(newSessionId);
      }
    } catch (error) {
      console.error("Erro ao inicializar ID de sessão:", error);
      
      // Fallback - criar um ID temporário mesmo se houver erro
      const fallbackId = `fallback_${Date.now()}`;
      setSessionId(fallbackId);
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
      console.error("Não foi possível adicionar ao carrinho: ID de sessão não disponível");
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o produto ao carrinho. Tente recarregar a página.",
        variant: "destructive",
      });
      return;
    }
    
    console.log(`Adicionando produto ${productId} ao carrinho com quantidade ${quantity} usando sessionId ${sessionId}`);
    
    try {
      // Primeiro vamos verificar se o produto já existe no carrinho
      const existingItem = cartItems.find(item => item.productId === productId);
      
      if (existingItem) {
        console.log(`Produto ${productId} já existe no carrinho com ID ${existingItem.id}, atualizando quantidade`);
        
        // Atualizar a quantidade em vez de adicionar novamente
        const newQuantity = existingItem.quantity + quantity;
        
        const updateResponse = await fetch(`/api/cart/${existingItem.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity: newQuantity }),
        });
        
        if (!updateResponse.ok) {
          console.error("Falha ao atualizar item no carrinho:", updateResponse.status, updateResponse.statusText);
          throw new Error("Falha ao atualizar item no carrinho");
        }
        
        const updateResult = await updateResponse.json();
        console.log("Quantidade do produto atualizada:", updateResult);
      } else {
        // Adicionar novo item ao carrinho
        console.log(`Adicionando novo produto ${productId} ao carrinho`);
        
        const addResponse = await fetch("/api/cart", {
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
        
        if (!addResponse.ok) {
          console.error("Falha ao adicionar ao carrinho:", addResponse.status, addResponse.statusText);
          throw new Error("Falha ao adicionar ao carrinho");
        }
        
        const addResult = await addResponse.json();
        console.log("Produto adicionado ao carrinho:", addResult);
      }
      
      // Buscar itens atualizados do carrinho
      console.log("Buscando itens atualizados do carrinho");
      await fetchCartItems();
      
      // Abrir o carrinho após adicionar o produto
      console.log("Abrindo o carrinho automaticamente");
      setIsCartOpen(true);
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o produto ao carrinho.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCartItemQuantity = async (cartItemId: number, quantity: number) => {
    if (!sessionId) {
      console.error("Não foi possível atualizar item: ID de sessão não disponível");
      return;
    }
    
    console.log(`Atualizando quantidade do item ${cartItemId} para ${quantity}`);
    
    try {
      const response = await fetch(`/api/cart/${cartItemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });
      
      if (!response.ok) {
        console.error("Falha ao atualizar item:", response.status, response.statusText);
        throw new Error("Falha ao atualizar item");
      }
      
      const result = await response.json();
      console.log("Item atualizado com sucesso:", result);
      
      await fetchCartItems();
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o item do carrinho.",
        variant: "destructive",
      });
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    if (!sessionId) {
      console.error("Não foi possível remover item: ID de sessão não disponível");
      return;
    }
    
    console.log(`Removendo item ${cartItemId} do carrinho`);
    
    try {
      const response = await fetch(`/api/cart/${cartItemId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        console.error("Falha ao remover item:", response.status, response.statusText);
        throw new Error("Falha ao remover item");
      }
      
      console.log("Item removido com sucesso");
      
      await fetchCartItems();
    } catch (error) {
      console.error("Erro ao remover item:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o item do carrinho.",
        variant: "destructive",
      });
    }
  };

  const clearCart = async () => {
    if (!sessionId) {
      console.error("Não foi possível limpar carrinho: ID de sessão não disponível");
      return;
    }
    
    console.log(`Limpando todos os itens do carrinho para a sessão ${sessionId}`);
    
    try {
      const response = await fetch(`/api/cart/clear/${sessionId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        console.error("Falha ao limpar carrinho:", response.status, response.statusText);
        throw new Error("Falha ao limpar carrinho");
      }
      
      console.log("Carrinho limpo com sucesso");
      
      // Atualizando o estado local imediatamente para feedback instantâneo
      setCartItems([]);
    } catch (error) {
      console.error("Erro ao limpar carrinho:", error);
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
