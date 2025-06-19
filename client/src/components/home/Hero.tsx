import { Link } from "wouter";

const Hero = () => {
  return (
    <section className="relative bg-light h-[500px] md:h-[600px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://res.cloudinary.com/dzwfuzxxw/image/upload/v1750338312/cynthiamakeup_xgkzv0.webp" 
          alt="Cynthia Makeup - Produtos de beleza" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
        <div className="max-w-xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-montserrat text-white mb-6">
            Descubra sua beleza com <span className="text-secondary">Cynthia Makeup</span>
          </h1>
          <p className="text-lg md:text-xl text-white mb-8">
            Produtos de alta qualidade para realçar sua beleza natural
          </p>
          <Link href="/produtos" className="inline-block bg-primary text-white font-medium py-3 px-8 rounded-md hover:bg-opacity-90 transition">
            Ver Produtos
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
