import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Erro",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulating API call
    setTimeout(() => {
      toast({
        title: "Sucesso!",
        description: "Você foi inscrito em nossa newsletter.",
      });
      setEmail("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section className="py-12 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold font-montserrat mb-4">
            Inscreva-se na nossa Newsletter
          </h2>
          <p className="text-gray-700 mb-8">
            Fique por dentro das novidades, promoções exclusivas e dicas de maquiagem.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <input 
              type="email" 
              placeholder="Seu email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-primary text-white font-medium py-3 px-6 rounded-md hover:bg-opacity-90 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Enviando..." : "Inscrever-se"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
