import { Link } from "wouter";

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
}

const categories: Category[] = [
  {
    id: "face",
    name: "Rosto",
    description: "Bases, corretivos e mais",
    image: "https://images.unsplash.com/photo-1631730486572-226d1f595b68?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=80"
  },
  {
    id: "eyes",
    name: "Olhos",
    description: "Sombras, delineadores e máscaras",
    image: "https://pixabay.com/get/g9161a855dd5bbc4d37d4bef8d8a233cf29275ef3fd43a5e9404df7fa5be341196aa9600f3ab509dd6750af15ebcbc3b3_1280.jpg"
  },
  {
    id: "lips",
    name: "Lábios",
    description: "Batons, glosses e lápis",
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=80"
  },
  {
    id: "accessories",
    name: "Acessórios",
    description: "Pincéis, esponjas e mais",
    image: "https://images.unsplash.com/photo-1567721913486-6585f069b332?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=80"
  }
];

const Categories = () => {
  return (
    <section id="categorias" className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold font-montserrat text-center mb-12">Categorias</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => (
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
    <Link href={`/produtos?categoria=${category.id}`}>
      <a className="group">
        <div className="relative overflow-hidden rounded-lg aspect-square">
          <img 
            src={category.image} 
            alt={`Produtos para ${category.name}`} 
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-xl font-montserrat font-semibold text-white">{category.name}</h3>
            <p className="text-sm text-white">{category.description}</p>
          </div>
        </div>
      </a>
    </Link>
  );
};

export default Categories;
