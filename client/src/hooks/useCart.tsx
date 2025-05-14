import { useContext } from "react";
import { CartContext } from "@/App";

// Hook simplificado para acessar o contexto do carrinho
export function useCart() {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error("useCart deve ser usado dentro do CartContext");
  }
  
  return context;
}