import { 
  createContext, 
  useState, 
  useEffect, 
  ReactNode 
} from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SESSION_ID } from "@/lib/sessionManager";
import { CartItemWithProduct } from "@shared/schema";

interface CartContextType {
  cartItems: CartItemWithProduct[];
  isLoading: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateCartItemQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCartItems: () => Promise<CartItemWithProduct[]>;
}

// Definindo valores padrão do contexto
const defaultContext: CartContextType = {
  cartItems: [],
  isLoading: false,
  isCartOpen: false,
  setIsCartOpen: () => {},
  addToCart: async () => {},
  updateCartItemQuantity: async () => {},
  removeFromCart: async () => {},
  clearCart: async () => {},
  fetchCartItems: async () => [],
};

export const CartContext = createContext<CartContextType>(defaultContext);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  // Estado do carrinho
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Buscar itens do carrinho na montagem do componente
  useEffect(() => {
    console.log("Inicializando carrinho com SESSION_ID:", SESSION_ID);
    fetchCartItems();
  }, []);

  const fetchCartItems = async (): Promise<CartItemWithProduct[]> => {
    console.log("Buscando itens do carrinho para a sessão:", SESSION_ID);
    setIsLoading(true);
    try {
      // Fazer requisição para a API
      const response = await fetch(`/api/cart/${SESSION_ID}`);
      if (!response.ok) {
        console.error("Falha ao buscar carrinho:", response.status, response.statusText);
        throw new Error("Falha ao buscar carrinho");
      }
      
      const data = await response.json();
      console.log("Itens do carrinho obtidos:", data);
      setCartItems(data);
      return data;
    } catch (error) {
      console.error("Erro ao buscar itens do carrinho:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os itens do carrinho.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (productId: number, quantity = 1) => {
    console.log(`[CartContext] Adicionando produto ${productId} ao carrinho com quantidade ${quantity}`);
    
    try {
      // Primeiro vamos verificar se o produto já existe no carrinho
      const existingItem = cartItems.find(item => item.productId === productId);
      
      if (existingItem) {
        console.log(`[CartContext] Produto ${productId} já existe no carrinho com ID ${existingItem.id}, atualizando quantidade`);
        
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
          console.error("[CartContext] Falha ao atualizar item no carrinho:", updateResponse.status, updateResponse.statusText);
          throw new Error("Falha ao atualizar item no carrinho");
        }
        
        const updateResult = await updateResponse.json();
        console.log("[CartContext] Quantidade do produto atualizada:", updateResult);
      } else {
        // Adicionar novo item ao carrinho
        console.log(`[CartContext] Adicionando novo produto ${productId} ao carrinho`);
        
        const addResponse = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId,
            quantity,
            sessionId: SESSION_ID,
          }),
        });
        
        if (!addResponse.ok) {
          console.error("[CartContext] Falha ao adicionar ao carrinho:", addResponse.status, addResponse.statusText);
          throw new Error("Falha ao adicionar ao carrinho");
        }
        
        const addResult = await addResponse.json();
        console.log("[CartContext] Produto adicionado ao carrinho:", addResult);
      }
      
      // Buscar itens atualizados do carrinho
      console.log("[CartContext] Buscando itens atualizados do carrinho");
      const updatedItems = await fetchCartItems();
      console.log("[CartContext] Total de itens no carrinho após adição:", updatedItems.length);
      
      // Não abrimos o carrinho aqui, deixamos essa responsabilidade para o hook useCart
      // para evitar conflitos entre estados
    } catch (error) {
      console.error("[CartContext] Erro ao adicionar ao carrinho:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o produto ao carrinho.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCartItemQuantity = async (cartItemId: number, quantity: number) => {
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
    console.log(`Limpando todos os itens do carrinho para a sessão ${SESSION_ID}`);
    
    try {
      const response = await fetch(`/api/cart/clear/${SESSION_ID}`, {
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

  // Logging de mudanças de estado e busca de itens quando o carrinho é aberto
  useEffect(() => {
    console.log("Estado do carrinho foi alterado para:", isCartOpen ? "aberto" : "fechado");
    
    // Se o carrinho foi aberto, atualizar os itens
    if (isCartOpen) {
      console.log("[CartContext] Carrinho aberto, buscando itens atualizados");
      fetchCartItems().then(items => {
        console.log("[CartContext] Itens recuperados após abertura:", items.length);
      });
    }
  }, [isCartOpen]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        isLoading,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
        fetchCartItems, // Adicionando a função fetchCartItems ao contexto
      }}
    >
      {children}
    </CartContext.Provider>
  );
};