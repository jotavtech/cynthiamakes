import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { formatWhatsAppMessage, sendWhatsAppMessage } from "@/lib/whatsapp";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { toast } = useToast();
  const { 
    cartItems, 
    isLoading, 
    updateCartItemQuantity, 
    removeFromCart, 
    clearCart 
  } = useCart();
  
  // Calcular total do carrinho
  const total = cartItems.reduce((acc, item) => 
    acc + (item.product.price * item.quantity), 0);
  
  const formattedTotal = `R$ ${(total / 100).toFixed(2).replace('.', ',')}`;
  
  // Manipular checkout (integração com WhatsApp)
  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    
    try {
      // Criar mensagem para WhatsApp
      const message = formatWhatsAppMessage(cartItems);
      
      // Enviar para WhatsApp usando o número configurado
      sendWhatsAppMessage(message);
      
      // Limpar carrinho após checkout
      await clearCart();
      onClose();
      
      toast({
        title: "Pedido enviado!",
        description: "Enviamos seu pedido para o WhatsApp da Cynthia Makeup.",
      });
    } catch (err) {
      console.error('Erro ao enviar para WhatsApp:', err);
      toast({
        title: "Erro",
        description: "Não foi possível finalizar a compra.",
        variant: "destructive",
      });
    }
  };
  
  // Determinar classes CSS para animação
  const drawerClasses = `absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-xl flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`;
  
  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={drawerClasses}>
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-montserrat font-semibold">Seu Carrinho</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:text-accent transition"
            aria-label="Fechar carrinho"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full"></div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Seu carrinho está vazio</p>
              <p className="mt-2 text-sm">Adicione produtos para continuar comprando</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex border-b pb-4 mb-4">
                  <div className="w-20 h-20 rounded-md overflow-hidden border">
                    <img 
                      src={item.product.imageUrl} 
                      alt={item.product.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-montserrat font-medium text-primary">{item.product.name}</h4>
                    <div className="text-accent font-medium mt-1">{item.product.formattedPrice}</div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center mt-2 space-x-2">
                      <button
                        onClick={() => updateCartItemQuantity(item.id, Math.max(1, item.quantity - 1))}
                        disabled={isLoading}
                        className="p-1 rounded border hover:bg-gray-100 disabled:opacity-50"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                        disabled={isLoading}
                        className="p-1 rounded border hover:bg-gray-100 disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        disabled={isLoading}
                        className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-montserrat font-semibold text-lg">Total:</span>
              <span className="font-montserrat font-bold text-xl text-accent">{formattedTotal}</span>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full bg-accent text-white py-3 rounded-md font-medium hover:bg-accent-dark transition disabled:opacity-50"
              >
                {isLoading ? "Processando..." : "Finalizar Compra"}
              </button>
              
              <button
                onClick={clearCart}
                disabled={isLoading}
                className="w-full border border-gray-300 text-gray-700 py-2 rounded-md font-medium hover:bg-gray-50 transition disabled:opacity-50"
              >
                Limpar Carrinho
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;