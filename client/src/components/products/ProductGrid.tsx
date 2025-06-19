import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import ProductCard from "./ProductCard";
import { DisplayProduct } from "@shared/schema";
import { filterProducts, sortProducts } from "@/lib/utils";

interface ProductGridProps {
  filters: {
    categories: string[];
    priceRanges: string[];
    brands: string[];
  };
  sortOption: string;
}

const ProductGrid = ({ filters, sortOption }: ProductGridProps) => {
  const [filteredProducts, setFilteredProducts] = useState<DisplayProduct[]>([]);
  
  const { data: products, isLoading, error } = useQuery<DisplayProduct[]>({
    queryKey: ["/api/products"],
    refetchInterval: 1000,
    refetchOnWindowFocus: true,
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    if (products) {
      // Apply filters
      const filtered = filterProducts(products, filters);
      
      // Apply sorting
      const sorted = sortProducts(filtered, sortOption);
      
      setFilteredProducts(sorted);
    }
  }, [products, filters, sortOption]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        Erro ao carregar produtos. Por favor, tente novamente mais tarde.
      </div>
    );
  }

  if (!filteredProducts || filteredProducts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Nenhum produto encontrado para os filtros selecionados.
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p>
          <span className="font-medium">{filteredProducts.length}</span> produtos
        </p>
        <div className="flex items-center">
          <label htmlFor="sort" className="mr-2 text-sm">Ordenar por:</label>
          <select 
            id="sort" 
            className="py-1 px-2 border rounded text-sm bg-white"
          >
            <option value="relevance">Relevância</option>
            <option value="price-asc">Preço: Menor para Maior</option>
            <option value="price-desc">Preço: Maior para Menor</option>
            <option value="newest">Mais Novos</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-center">
        <div className="flex space-x-1">
          <button className="px-4 py-2 border rounded-md text-sm bg-white hover:bg-light">
            Anterior
          </button>
          <button className="px-4 py-2 border rounded-md text-sm bg-primary text-white">
            1
          </button>
          <button className="px-4 py-2 border rounded-md text-sm bg-white hover:bg-light">
            2
          </button>
          <button className="px-4 py-2 border rounded-md text-sm bg-white hover:bg-light">
            3
          </button>
          <button className="px-4 py-2 border rounded-md text-sm bg-white hover:bg-light">
            Próximo
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;
