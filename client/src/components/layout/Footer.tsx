import { Link } from "wouter";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Instagram, 
  Youtube, 
  Twitter 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";

const Footer = () => {
  // Buscar categorias da API
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Filtrar apenas categorias ativas
  const activeCategories = categories?.filter(category => category.isActive) || [];

  return (
    <footer className="bg-primary text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div>
            <h3 className="text-xl font-montserrat font-semibold mb-4">Cynthia Makeup</h3>
            <p className="mb-4">Realçando sua beleza natural com produtos de alta qualidade.</p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="hover:text-secondary transition"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a 
                href="#" 
                className="hover:text-secondary transition"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a 
                href="#" 
                className="hover:text-secondary transition"
                aria-label="Youtube"
              >
                <Youtube className="h-6 w-6" />
              </a>
              <a 
                href="#" 
                className="hover:text-secondary transition"
                aria-label="Twitter"
              >
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          {/* Navigation Column */}
          <div>
            <h3 className="text-lg font-montserrat font-semibold mb-4">Navegação</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-secondary transition">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/produtos" className="hover:text-secondary transition">
                  Produtos
                </Link>
              </li>
              <li>
                <Link href="/produtos" className="hover:text-secondary transition">
                  Categorias
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="hover:text-secondary transition">
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="/contato" className="hover:text-secondary transition">
                  Contato
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Categories Column */}
          <div>
            <h3 className="text-lg font-montserrat font-semibold mb-4">Categorias</h3>
            <ul className="space-y-2">
              {activeCategories.map((category) => (
                <li key={category.id}>
                  <Link 
                    href={`/produtos?categoria=${category.slug}`} 
                    className="hover:text-secondary transition"
                  >
                    {category.name}
                </Link>
              </li>
              ))}
            </ul>
          </div>
          
          {/* Contact Column */}
          <div>
            <h3 className="text-lg font-montserrat font-semibold mb-4">Contato</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                <span>+55 83 98838-2886</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                <span>contato@cynthiamakes1.com.br</span>
              </li>
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 mt-1" />
                <span>Rua Dom Vital, S/N, Mamanguape, CEP 58280-000</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} Cynthia Makeup. Todos os direitos reservados.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/privacidade" className="hover:text-secondary transition">
              Política de Privacidade
            </Link>
            <Link href="/termos" className="hover:text-secondary transition">
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
