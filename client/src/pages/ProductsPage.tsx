import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import ProductFilters from "@/components/products/ProductFilters";
import ProductGrid from "@/components/products/ProductGrid";
import { Helmet } from "react-helmet";

interface Filters {
  categories: string[];
  priceRanges: string[];
  brands: string[];
}

const ProductsPage = () => {
  const [location] = useLocation();
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    priceRanges: [],
    brands: [],
  });
  const [sortOption, setSortOption] = useState("relevance");

  // Parse query params on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const categoryParam = searchParams.get("categoria");
    
    if (categoryParam) {
      setFilters(prev => ({
        ...prev,
        categories: [categoryParam],
      }));
    }
  }, [location]);

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (option: string) => {
    setSortOption(option);
  };

  return (
    <>
      <Helmet>
        <title>Produtos - Cynthia Makeup</title>
        <meta name="description" content="Explore nossa coleção de maquiagens. Bases, sombras, batons e muito mais. Filtros por categoria, preço e marca para encontrar o produto perfeito." />
      </Helmet>
      
      <section className="py-12 bg-light">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold font-montserrat text-center mb-4">
            Nossos Produtos
          </h1>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Descubra nossa seleção de produtos de maquiagem de alta qualidade para realçar sua beleza natural.
          </p>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Filter Sidebar */}
            <ProductFilters onFilterChange={handleFilterChange} />
            
            {/* Products Grid */}
            <div className="flex-1">
              <ProductGrid 
                filters={filters} 
                sortOption={sortOption} 
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductsPage;
