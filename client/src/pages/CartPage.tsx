import { useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Trash2, ShoppingBag, MinusCircle, PlusCircle, ArrowLeft, Send } from "lucide-react";
import { formatWhatsAppMessage } from "@/lib/utils";

const CartPage = () => {
  const { cartItems, updateCartItemQuantity, removeFromCart, clearCart } = useCart();
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cartItems.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);

  const handleQuantityChange = (id: number, quantity: number) => {
    if (quantity < 1) return;
    updateCartItemQuantity(id, quantity);
  };

  const handleWhatsAppSubmit = () => {
    if (cartItems.length === 0) return;
    
    setIsSubmitting(true);
    
    try {
      // Formatar mensagem para WhatsApp
      const phoneNumber = "5583993187473"; // Número fixo para o WhatsApp da loja
      const message = formatWhatsAppMessage(cartItems);
      
      // Criar URL para WhatsApp
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      
      // Abrir WhatsApp em nova aba
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error("Erro ao enviar para WhatsApp:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Carrinho | Cynthia Makeup</title>
        <meta name="description" content="Seu carrinho de compras. Revise seus produtos e finalize seu pedido." />
      </Helmet>
      
      <div className="container py-8 px-4 md:px-6">
        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-montserrat">Seu Carrinho</h1>
            <p className="text-gray-500 mt-1">
              {cartItems.length === 0 ? "Seu carrinho está vazio" : 
                `${cartItems.length} ${cartItems.length === 1 ? "produto" : "produtos"} no carrinho`}
            </p>
          </div>

          {cartItems.length === 0 ? (
            <Card>
              <CardContent className="pt-6 flex flex-col items-center justify-center text-center py-12">
                <ShoppingBag className="h-12 w-12 text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Seu carrinho está vazio</h2>
                <p className="text-gray-500 mb-6">Adicione produtos para continuar comprando</p>
                <Button asChild>
                  <Link href="/produtos">Continuar Comprando</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Itens do Carrinho</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex py-4 px-6">
                          <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex justify-between">
                              <div>
                                <h3 className="text-sm font-medium">{item.product.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">{item.product.formattedPrice}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">
                                  {formatPrice(item.product.price * item.quantity)}
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-4">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                  className="text-gray-500 hover:text-primary"
                                >
                                  <MinusCircle className="h-5 w-5" />
                                </button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  className="text-gray-500 hover:text-primary"
                                >
                                  <PlusCircle className="h-5 w-5" />
                                </button>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-gray-500 hover:text-red-500"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-4">
                    <Button variant="outline" asChild>
                      <Link href="/produtos">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Continuar comprando
                      </Link>
                    </Button>
                    <Button variant="ghost" onClick={clearCart}>
                      <Trash2 className="mr-2 h-4 w-4" /> Limpar carrinho
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Resumo do Pedido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleWhatsAppSubmit}
                      disabled={cartItems.length === 0 || isSubmitting}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Enviando..." : "Finalizar pelo WhatsApp"}
                    </Button>
                    <p className="text-xs text-gray-500 text-center">
                      Ao finalizar, você será redirecionado para o WhatsApp para completar seu pedido.
                    </p>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartPage;