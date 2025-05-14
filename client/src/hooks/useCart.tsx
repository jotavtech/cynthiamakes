import { useContext } from "react";
import { CartContext } from "@/context/CartContext";

export const useCart = () => {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  
  // Função melhorada para adicionar ao carrinho e abrir o carrinho em seguida
  const addToCartAndOpen = async (productId: number, quantity: number = 1) => {
    console.log(`[useCart] Adicionando produto ${productId} ao carrinho e abrindo o drawer`);
    try {
      // Adicionar o produto ao carrinho
      await context.addToCart(productId, quantity);
      
      // Atualizar explicitamente os itens do carrinho antes de abri-lo
      await context.fetchCartItems();
      
      // Abrir o carrinho somente após ter certeza de que os dados foram atualizados
      setTimeout(() => {
        console.log("[useCart] Dados do carrinho atualizados, abrindo o drawer");
        context.setIsCartOpen(true);
      }, 300);
      
      return true;
    } catch (error) {
      console.error("[useCart] Erro ao adicionar produto:", error);
      return false;
    }
  };
  
  // Funções auxiliares para simplificar o uso
  const openCart = () => {
    console.log("[useCart] Abrindo carrinho");
    context.setIsCartOpen(true);
  };
  
  const closeCart = () => {
    console.log("[useCart] Fechando carrinho");
    context.setIsCartOpen(false);
  };
  
  const toggleCart = () => {
    console.log("[useCart] Alternando estado do carrinho");
    context.setIsCartOpen(!context.isCartOpen);
  };
  
  // Encapsular a função fetchCartItems do contexto para garantir uma interface consistente
  const fetchCartItems = async () => {
    if (context.fetchCartItems) {
      return await context.fetchCartItems();
    }
    return [];
  };

  // Retornar o contexto enriquecido com as funções auxiliares
  return {
    ...context,
    openCart,
    closeCart,
    toggleCart,
    addToCartAndOpen,
    fetchCartItems
  };
};
