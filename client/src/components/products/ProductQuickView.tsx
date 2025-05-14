import { useState } from "react";
import { X, Star, StarHalf, Plus, Minus } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { DisplayProduct } from "@shared/schema";

interface ProductQuickViewProps {
  product: DisplayProduct;
  isOpen: boolean;
  onClose: () => void;
}

const ProductQuickView = ({ product, isOpen, onClose }: ProductQuickViewProps) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart(product.id, quantity);
      toast({
        title: "Produto adicionado",
        description: `${product.name} foi adicionado ao carrinho.`,
      });
      // Don't close the modal immediately, just show the success message
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o produto ao carrinho.",
        variant: "destructive",
      });
      console.error("Erro ao adicionar ao carrinho:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop/overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white shadow hover:bg-gray-100 z-10"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product image */}
          <div className="h-64 md:h-96 bg-gray-100 relative">
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover object-center" 
            />
            {product.isNew && (
              <div className="absolute top-4 left-4">
                <span className="bg-accent text-white text-sm px-2 py-1 rounded-md">
                  Novo
                </span>
              </div>
            )}
          </div>
          
          {/* Product info */}
          <div className="p-6 flex flex-col">
            <h2 className="text-2xl font-montserrat font-semibold mb-2">{product.name}</h2>
            <p className="text-gray-500 mb-4">{product.brand}</p>
            
            <div className="flex items-center mb-4">
              <ProductRating rating={4.5} />
              <span className="text-gray-500 text-sm ml-2">(120 avaliações)</span>
            </div>
            
            <p className="text-lg font-semibold mb-2">{product.formattedPrice}</p>
            
            <div className="border-t border-b py-4 my-4">
              <p className="text-gray-700 mb-4">{product.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="w-24 text-gray-600">Categoria:</span>
                  <span>{product.category}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-24 text-gray-600">SKU:</span>
                  <span>{product.id}</span>
                </div>
              </div>
            </div>
            
            {/* Quantity selector */}
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-gray-600">Quantidade:</span>
              <div className="flex items-center border rounded-md">
                <button 
                  onClick={decreaseQuantity}
                  className="px-3 py-1 hover:bg-gray-100"
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-1">{quantity}</span>
                <button 
                  onClick={increaseQuantity}
                  className="px-3 py-1 hover:bg-gray-100"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Add to cart button */}
            <button 
              onClick={handleAddToCart}
              disabled={isAdding}
              className="bg-primary text-white py-3 rounded-md hover:bg-opacity-90 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isAdding ? "Adicionando..." : "Adicionar ao Carrinho"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Product Rating Component (reused from ProductCard)
interface ProductRatingProps {
  rating: number;
}

const ProductRating = ({ rating }: ProductRatingProps) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return (
    <div className="flex">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="h-4 w-4 text-yellow-400" fill="currentColor" />
      ))}
      {hasHalfStar && <StarHalf className="h-4 w-4 text-yellow-400" fill="currentColor" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      ))}
    </div>
  );
};

export default ProductQuickView;