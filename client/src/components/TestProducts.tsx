import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const TestProducts = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { data: products, isLoading, error, refetch } = useQuery<any[]>({
    queryKey: ["/api/products", refreshKey],
    refetchInterval: 1000,
    refetchOnWindowFocus: true,
    staleTime: 0,
    gcTime: 0,
  });

  const { data: adminProducts } = useQuery<any[]>({
    queryKey: ["/api/products/admin", refreshKey],
    refetchInterval: 1000,
    refetchOnWindowFocus: true,
    staleTime: 0,
    gcTime: 0,
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Teste de Produtos</h2>
      
      <button 
        onClick={handleRefresh}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Atualizar Manualmente
      </button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Produtos Gerais ({products?.length || 0})</h3>
          {isLoading ? (
            <p>Carregando...</p>
          ) : error ? (
            <p className="text-red-500">Erro: {error.message}</p>
          ) : (
            <ul className="space-y-1">
              {products?.map(product => (
                <li key={product.id} className="text-sm">
                  {product.name} (ID: {product.id})
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Produtos Admin ({adminProducts?.length || 0})</h3>
          <ul className="space-y-1">
            {adminProducts?.map(product => (
              <li key={product.id} className="text-sm">
                {product.name} (ID: {product.id})
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="mt-4 p-2 bg-gray-100 rounded">
        <p className="text-xs">
          Última atualização: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default TestProducts; 