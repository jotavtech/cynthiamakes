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
  isCartOpen: boolean;
  isLoading: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateCartItemQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleCart: () => void;
  openCart: () => void;   // Função explícita para abrir o carrinho
  closeCart: () => void;  // Função explícita para fechar o carrinho
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
  openCart: () => {},
  closeCart: () => {},
});

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // SESSION_ID é uma constante importada de sessionManager que já contém o ID da sessão

  // Buscar itens do carrinho na montagem do componente
  useEffect(() => {
    console.log("Inicializando carrinho com SESSION_ID:", SESSION_ID);
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
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
    } catch (error) {
      console.error("Erro ao buscar itens do carrinho:", error);
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
    console.log(`Adicionando produto ${productId} ao carrinho com quantidade ${quantity} usando SESSION_ID ${SESSION_ID}`);
    
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
            sessionId: SESSION_ID,
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
      openCart();
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

  const toggleCart = () => {
    console.log("Toggling cart from", isCartOpen, "to", !isCartOpen);
    setIsCartOpen(prevState => !prevState);
  };
  
  // Funções específicas para abrir e fechar o carrinho
  const openCart = () => {
    console.log("Opening cart explicitly");
    setIsCartOpen(true);
  };
  
  const closeCart = () => {
    console.log("Closing cart explicitly");
    setIsCartOpen(false);
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
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};