import { Helmet } from "react-helmet";

const SobrePage = () => {
  return (
    <>
      <Helmet>
        <title>Sobre - Cynthia Makeup</title>
        <meta name="description" content="Conheça a história e a visão da Cynthia Makeup, sua loja de maquiagem online favorita." />
      </Helmet>

      <div className="bg-light py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold font-montserrat mb-6 text-center">
              Sobre a Cynthia Makeup
            </h1>
            
            <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
              <h2 className="text-2xl font-semibold font-montserrat mb-4 text-primary">
                Nossa História
              </h2>
              <p className="mb-4 text-gray-700">
                A Cynthia Makeup nasceu em 2018 da paixão de Cynthia Santos pela maquiagem e pelo poder transformador que ela tem na vida das pessoas. 
                O que começou como um pequeno negócio em casa, rapidamente cresceu para se tornar uma das mais queridas lojas de cosméticos do país.
              </p>
              <p className="mb-4 text-gray-700">
                Nossa fundadora, Cynthia, sempre acreditou que a maquiagem não deve apenas realçar a beleza exterior, 
                mas também ajudar cada pessoa a expressar sua individualidade e fortalecer sua autoconfiança. 
                Essa filosofia continua guiando tudo o que fazemos.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
              <h2 className="text-2xl font-semibold font-montserrat mb-4 text-primary">
                Nossa Missão
              </h2>
              <p className="mb-4 text-gray-700">
                Buscamos oferecer produtos de maquiagem de alta qualidade a preços acessíveis, sempre prezando pelo atendimento personalizado 
                e pela valorização da beleza única de cada cliente.
              </p>
              <p className="mb-4 text-gray-700">
                Acreditamos que a maquiagem é uma forma de arte e autoexpressão. Por isso, nos esforçamos para criar uma comunidade onde todos 
                possam se sentir incluídos e inspirados.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
              <h2 className="text-2xl font-semibold font-montserrat mb-4 text-primary">
                Nossos Valores
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li><strong>Qualidade:</strong> Buscamos sempre os melhores produtos e fórmulas para nossos clientes.</li>
                <li><strong>Inclusão:</strong> Acreditamos que a maquiagem é para todos, sem exceção.</li>
                <li><strong>Sustentabilidade:</strong> Trabalhamos para reduzir nosso impacto ambiental, escolhendo produtos e embalagens mais sustentáveis.</li>
                <li><strong>Atendimento:</strong> Nos dedicamos a oferecer uma experiência personalizada e atenciosa.</li>
                <li><strong>Inovação:</strong> Estamos sempre atualizados com as tendências e novidades do mundo da maquiagem.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SobrePage;