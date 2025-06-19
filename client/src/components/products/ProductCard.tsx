import { useState } from "react";
import { Star, StarHalf, Eye } from "lucide-react";
import { DisplayProduct } from "@shared/schema";
import ProductQuickView from "./ProductQuickView";
import { AddToCartButton } from "@/components/ui/add-to-cart-button";

interface ProductCardProps {
  product: DisplayProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  
  const openQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  // Determine product badges
  const hasDiscount = false; // To be implemented with actual discount logic
  const discountPercentage = 0; // To be calculated based on product data

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition group">
      <div className="relative overflow-hidden aspect-square">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
        />
        {product.isNew && (
          <div className="absolute top-3 left-3">
            <span className="bg-accent text-white text-xs px-2 py-1 rounded">Novo</span>
          </div>
        )}
        {hasDiscount && (
          <div className="absolute top-3 left-3">
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
              -{discountPercentage}%
            </span>
          </div>
        )}
        
        {/* Quick view button */}
        <button
          onClick={openQuickView}
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 opacity-0 group-hover:bg-opacity-20 group-hover:opacity-100 transition-all duration-300"
          aria-label="Visualização rápida"
        >
          <div className="bg-white rounded-full p-3 flex items-center justify-center shadow-md hover:bg-gray-100">
            <Eye className="h-5 w-5 text-primary" />
          </div>
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-montserrat font-medium text-lg mb-1">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="font-semibold">{product.formattedPrice}</span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through ml-2">
                R$ XX,XX
              </span>
            )}
          </div>
          <ProductRating rating={4.5} />
        </div>
        <AddToCartButton 
          productId={product.id}
          productName={product.name}
          className="w-full"
          buttonText="Adicionar ao Carrinho"
          size="default"
          showIcon={true}
        />
      </div>
      
      {/* Quick view modal */}
      <ProductQuickView 
        product={product} 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
      />
    </div>
  );
};

// Product Rating Component
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

export default ProductCard;
