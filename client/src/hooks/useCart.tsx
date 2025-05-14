import { useContext } from "react";
import { CartContext } from "@/context/CartContext";

export const useCart = () => {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  
  // Adicionar funções auxiliares para simplificar o uso
  const openCart = () => {
    console.log("useCart: Abrindo carrinho");
    context.setIsCartOpen(true);
  };
  
  const closeCart = () => {
    console.log("useCart: Fechando carrinho");
    context.setIsCartOpen(false);
  };
  
  const toggleCart = () => {
    console.log("useCart: Alternando estado do carrinho");
    context.setIsCartOpen(!context.isCartOpen);
  };
  
  // Retornar o contexto enriquecido com as funções auxiliares
  return {
    ...context,
    openCart,
    closeCart,
    toggleCart
  };
};
