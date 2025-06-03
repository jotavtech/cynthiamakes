import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Category } from "@shared/schema";

const Categories = () => {
  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (isLoading) {
    return (
      <section id="categorias" className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-montserrat text-center mb-12">Categorias</h2>
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !categories) {
    return (
      <section id="categorias" className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-montserrat text-center mb-12">Categorias</h2>
          <div className="text-center text-red-500">
            Erro ao carregar categorias. Tente novamente mais tarde.
          </div>
        </div>
      </section>
    );
  }

  // Filtra apenas categorias ativas
  const activeCategories = categories.filter(category => category.isActive);

  return (
    <section id="categorias" className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold font-montserrat text-center mb-12">Categorias</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {activeCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <Link href={`/produtos?categoria=${category.slug}`} className="group">
      <div className="relative overflow-hidden rounded-lg aspect-square">
        <img 
          src={category.imageUrl} 
          alt={`Produtos para ${category.name}`} 
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-xl font-montserrat font-semibold text-white">{category.name}</h3>
          <p className="text-sm text-white">{category.description}</p>
        </div>
      </div>
    </Link>
  );
};

export default Categories;
