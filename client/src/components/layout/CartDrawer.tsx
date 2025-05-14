import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatWhatsAppMessage, generateWhatsAppURL } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { CartItemWithProduct } from "@shared/schema";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  // Usar estado local para os itens
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ID fixo da sessão para testes
  const sessionId = '99i47ng8zigy94xt079q59';
  
  // Funções CRUD do carrinho
  const updateQuantity = async (itemId: number, quantity: number) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      
      if (!response.ok) throw new Error('Falha ao atualizar quantidade');
      
      // Atualizar o item localmente para feedback imediato
      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ));
    } catch (err) {
      console.error('Erro ao atualizar quantidade:', err);
      setError('Não foi possível atualizar o item.');
    }
  };
  
  const removeItem = async (itemId: number) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Falha ao remover item');
      
      // Remover o item localmente para feedback imediato
      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Erro ao remover item:', err);
      setError('Não foi possível remover o item.');
    }
  };
  
  const clearCart = async () => {
    try {
      const response = await fetch(`/api/cart/clear/${sessionId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Falha ao limpar carrinho');
      
      // Limpar itens localmente
      setItems([]);
    } catch (err) {
      console.error('Erro ao limpar carrinho:', err);
      setError('Não foi possível limpar o carrinho.');
    }
  };
  
  // Efeito para carregar itens quando o drawer é aberto
  useEffect(() => {
    if (isOpen) {
      // Função para carregar os itens do carrinho
      const fetchItems = async () => {
        setLoading(true);
        setError(null);
        try {
          console.log('Buscando itens do carrinho...');
          const response = await fetch(`/api/cart/${sessionId}`);
          
          if (!response.ok) {
            throw new Error(`Erro ao buscar carrinho: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('Itens recebidos:', data);
          setItems(data);
        } catch (err) {
          console.error('Erro ao buscar itens do carrinho:', err);
          setError('Não foi possível carregar os itens do carrinho.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchItems();
    }
  }, [isOpen]);
  
  // Calcular total do carrinho
  const total = items.reduce((sum, item) => 
    sum + (item.product.price * item.quantity), 0);
  
  const formattedTotal = `R$ ${(total / 100).toFixed(2).replace('.', ',')}`;
  
  // Manipular checkout (integração com WhatsApp)
  const handleCheckout = () => {
    if (items.length === 0) return;
    
    try {
      // Número de telefone da Cynthia Makeup (conforme solicitado)
      const PHONE_NUMBER = "83993187473";
      
      // Criar mensagem para WhatsApp
      const message = formatWhatsAppMessage(items);
      
      // Gerar URL do WhatsApp
      const whatsappUrl = generateWhatsAppURL(PHONE_NUMBER, message);
      
      // Abrir WhatsApp
      window.open(whatsappUrl, '_blank');
      
      // Limpar carrinho após checkout
      clearCart();
      onClose();
    } catch (err) {
      console.error('Erro ao enviar para WhatsApp:', err);
      setError('Não foi possível finalizar a compra.');
    }
  };
  
  // Determinar classe CSS para animação do drawer
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
          <h2 className="text-xl font-montserrat font-semibold">Carrinho de Compras</h2>
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
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">
              {error}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Seu carrinho está vazio</p>
              <p className="mt-2 text-sm">Adicione produtos para continuar comprando</p>
            </div>
          ) : (
            items.map(item => (
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
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="p-1 border rounded-md"
                      aria-label="Diminuir quantidade"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="mx-2">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 border rounded-md"
                      aria-label="Aumentar quantidade"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="ml-auto text-red-500"
                      aria-label="Remover item"
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
            disabled={items.length === 0}
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

export default CartDrawer;