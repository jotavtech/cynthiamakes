import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
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
  onSuccess
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addToCartAndOpen } = useCart();
  const { toast } = useToast();

  const handleAddToCart = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    console.log(`[AddToCartButton] Adicionando produto ${productId} ao carrinho`);
    
    try {
      const success = await addToCartAndOpen(productId, quantity);
      
      if (success) {
        const productLabel = productName ? productName : `Produto #${productId}`;
        toast({
          title: "Produto adicionado",
          description: `${productLabel} foi adicionado ao carrinho.`,
        });
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error("Falha ao adicionar produto");
      }
    } catch (error) {
      console.error(`[AddToCartButton] Erro ao adicionar produto ${productId}:`, error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o produto ao carrinho.",
        variant: "destructive",
      });
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