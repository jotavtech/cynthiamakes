import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import { DisplayProduct } from "@shared/schema";
import { AddToCartButton } from "@/components/ui/add-to-cart-button";

const FeaturedProducts = () => {
  const { data: featuredProducts, isLoading, error } = useQuery<DisplayProduct[]>({
    queryKey: ["/api/products/featured"],
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
    staleTime: 0,
    gcTime: 2 * 60 * 1000,
  });

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold font-montserrat text-center mb-4">
          Produtos em Destaque
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Conheça os produtos mais amados pelos nossos clientes
        </p>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            Erro ao carregar produtos em destaque. Por favor, tente novamente mais tarde.
          </div>
        ) : featuredProducts && featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <FeaturedProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Nenhum produto em destaque encontrado.
          </div>
        )}
      </div>
    </section>
  );
};

interface FeaturedProductCardProps {
  product: DisplayProduct;
}

const FeaturedProductCard = ({ product }: FeaturedProductCardProps) => {
  return (
    <div className="bg-light p-6 rounded-lg flex flex-col items-center text-center">
      <img 
        src={product.imageUrl} 
        alt={product.name} 
        className="w-48 h-48 object-cover mb-6" 
      />
      <h3 className="font-montserrat font-semibold text-xl mb-2">{product.name}</h3>
      <p className="text-gray-600 mb-4">{product.description}</p>
      <div className="flex justify-center mb-4">
        <span className="font-semibold text-lg">{product.formattedPrice}</span>
      </div>
      <AddToCartButton 
        productId={product.id}
        productName={product.name} 
        className="w-full"
        variant="default"
      />
    </div>
  );
};

export default FeaturedProducts;
