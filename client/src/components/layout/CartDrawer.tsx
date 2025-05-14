import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatWhatsAppMessage } from "@/lib/utils";

interface CartDrawerProps {
  onClose: () => void;
}

const CartDrawer = ({ onClose }: CartDrawerProps) => {
  const { 
    cartItems, 
    updateCartItemQuantity, 
    removeFromCart,
    clearCart 
  } = useCart();

  const isEmpty = cartItems.length === 0;
  
  // Calculate total price
  const totalPrice = cartItems.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);
  
  const formattedTotal = `R$ ${(totalPrice / 100).toFixed(2).replace('.', ',')}`;

  // Handle checkout (WhatsApp integration)
  const handleCheckout = () => {
    if (isEmpty) return;
    
    const message = formatWhatsAppMessage(cartItems);
    const phoneNumber = "83993187473"; // O número do WhatsApp completo com DDD
    
    // Abre o WhatsApp com a mensagem formatada
    window.open(`https://api.whatsapp.com/send?phone=55${phoneNumber}&text=${encodeURIComponent(message)}`, '_blank');
    
    // Limpa o carrinho e fecha o drawer após enviar
    clearCart();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-montserrat font-semibold">Carrinho de Compras</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:text-accent transition"
            aria-label="Close cart"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isEmpty ? (
            <div className="text-center text-gray-500 py-8">
              <ShoppingBagIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Seu carrinho está vazio</p>
              <p className="mt-2 text-sm">Adicione produtos para continuar comprando</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex border-b pb-4">
                <div className="w-20 h-20 rounded-md overflow-hidden">
                  <img 
                    src={item.product.imageUrl} 
                    alt={item.product.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-medium">{item.product.name}</h4>
                  <div className="text-gray-500">{item.product.formattedPrice}</div>
                  <div className="flex items-center mt-2">
                    <button 
                      onClick={() => updateCartItemQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="p-1 border rounded-md"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="mx-2">{item.quantity}</span>
                    <button 
                      onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                      className="p-1 border rounded-md"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="ml-auto text-red-500"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t">
          <div className="flex justify-between mb-4">
            <span className="font-montserrat">Total:</span>
            <span className="font-montserrat font-semibold">{formattedTotal}</span>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={isEmpty}
            className="w-full bg-accent text-white font-medium py-3 rounded-md hover:bg-opacity-90 transition mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Finalizar Compra via WhatsApp
          </button>
          <button 
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-800 font-medium py-3 rounded-md hover:bg-gray-300 transition"
          >
            Continuar Comprando
          </button>
        </div>
      </div>
    </div>
  );
};

// Shopping bag icon
const ShoppingBagIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
    />
  </svg>
);

export default CartDrawer;
