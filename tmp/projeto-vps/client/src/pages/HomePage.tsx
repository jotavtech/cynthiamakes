import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import { Helmet } from "react-helmet";

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>Cynthia Makeup - Maquiagens Profissionais</title>
        <meta name="description" content="Produtos de maquiagem de alta qualidade para realçar sua beleza natural. Bases, sombras, batons e acessórios com entrega para todo o Brasil." />
      </Helmet>
      
      <Hero />
      <Categories />
      <FeaturedProducts />
    </>
  );
};

export default HomePage;
