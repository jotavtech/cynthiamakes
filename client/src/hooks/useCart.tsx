import { useState } from "react";
import { CartItemWithProduct } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Hook simplificado para adicionar e gerenciar o carrinho
export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // ID de sessão fixo para garantir consistência
  const sessionId = '99i47ng8zigy94xt079q59';
  
  // Função para buscar itens do carrinho
  const fetchCartItems = async () => {
    setIsLoading(true);
    try {
      console.log("Buscando itens do carrinho...");
      const response = await fetch(`/api/cart/${sessionId}`);
      if (!response.ok) throw new Error("Falha ao buscar carrinho");
      
      const data = await response.json();
      console.log("Itens recebidos:", data);
      setCartItems(data);
      return data;
    } catch (error) {
      console.error("Erro ao buscar itens:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para adicionar produto ao carrinho
  const addToCart = async (productId: number, quantity: number = 1) => {
    setIsLoading(true);
    try {
      console.log(`Adicionando produto ${productId} ao carrinho`);
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity, sessionId })
      });
      
      if (!response.ok) throw new Error("Falha ao adicionar produto");
      
      await fetchCartItems();
      return true;
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o produto ao carrinho."
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para adicionar ao carrinho e abrir o drawer
  const addToCartAndOpen = async (productId: number, quantity: number = 1) => {
    const success = await addToCart(productId, quantity);
    if (success) {
      setIsCartOpen(true);
    }
    return success;
  };
  
  // Funções de controle do drawer
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(!isCartOpen);
  
  return {
    cartItems,
    isLoading,
    isCartOpen,
    fetchCartItems,
    addToCart,
    addToCartAndOpen,
    openCart,
    closeCart,
    toggleCart,
    setIsCartOpen
  };
};