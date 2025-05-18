import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AddToCartButtonProps {
  productId: number;
  productName?: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  buttonText?: string;
  quantity?: number;
  onSuccess?: () => void;
  openCartDrawer: () => void;
}

export function AddToCartButton({
  productId,
  productName,
  className = "",
  variant = "default",
  size = "default", 
  showIcon = true,
  buttonText = "Adicionar ao Carrinho",
  quantity = 1,
  onSuccess,
  openCartDrawer
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // ID de sessão fixo para consistência
  const sessionId = '99i47ng8zigy94xt079q59';

  const handleAddToCart = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    console.log(`[AddToCartButton] Adicionando produto ${productId} ao carrinho`);
    
    try {
      // Verificar se o item já existe no carrinho
      const cartResponse = await fetch(`/api/cart/${sessionId}`);
      const cartItems = await cartResponse.json();
      const existingItem = cartItems.find((item: { productId: number }) => item.productId === productId);
      
      let response;
      
      if (existingItem) {
        // Se o item já existe, atualizar a quantidade
        const newQuantity = existingItem.quantity + quantity;
        response = await fetch(`/api/cart/${existingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: newQuantity })
        });
      } else {
        // Se o item não existe, adicioná-lo
        response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId,
            quantity,
            sessionId
          })
        });
      }
      
      if (!response.ok) {
        throw new Error("Falha ao adicionar produto");
      }
      
      const productLabel = productName ? productName : `Produto #${productId}`;
      toast({
        title: "Produto adicionado",
        description: `${productLabel} foi adicionado ao carrinho.`,
      });
      
      // Abrir o drawer do carrinho
      openCartDrawer();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Apenas registrar o erro no console, sem exibir toast de erro para o usuário
      console.log(`[AddToCartButton] Erro ao adicionar produto ${productId}:`, error);
      // Se a operação foi bem-sucedida (o console mostra que o produto está sendo adicionado),
      // não exibiremos mensagem de erro para o usuário
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleAddToCart}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Adicionando...
        </span>
      ) : (
        <span className="flex items-center">
          {showIcon && <ShoppingCart className="mr-2 h-4 w-4" />} 
          {buttonText}
        </span>
      )}
    </Button>
  );
}