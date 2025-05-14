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
      await context.addToCart(productId, quantity);
      context.setIsCartOpen(true);
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
  
  // Retornar o contexto enriquecido com as funções auxiliares
  return {
    ...context,
    openCart,
    closeCart,
    toggleCart,
    addToCartAndOpen
  };
};
