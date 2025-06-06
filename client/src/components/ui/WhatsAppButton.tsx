import { MessageCircle } from "lucide-react";
import { WHATSAPP_CONFIG, sendWhatsAppMessage } from "@/lib/whatsapp";

interface WhatsAppButtonProps {
  className?: string;
  message?: string;
}

const WhatsAppButton = ({ 
  className = "", 
  message = `Olá! Vim pelo site ${WHATSAPP_CONFIG.WEBSITE_SOURCE} e gostaria de mais informações sobre os produtos.` 
}: WhatsAppButtonProps) => {
  
  const handleWhatsAppClick = () => {
    sendWhatsAppMessage(message);
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className={`fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50 ${className}`}
      title="Falar no WhatsApp"
      aria-label="Entrar em contato via WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  );
};

export default WhatsAppButton; 