import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate a random session ID for the cart
export function generateSessionId() {
  // Criar um ID mais consistente usando timestamp e random
  const timestamp = new Date().getTime();
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `cart_${timestamp}_${randomPart}`;
}

// Format WhatsApp message for cart checkout
// Formatar número de telefone para o formato do WhatsApp
export function formatPhoneNumber(phone: string): string {
  // Remove todos os caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Certifique-se de que o número comece com o código do país (Brasil = 55)
  // Se não começar com 55, adiciona-o
  if (cleaned.startsWith('55')) {
    return cleaned;
  }
  return '55' + cleaned;
}

// Gerar URL do WhatsApp com a mensagem formatada
export function generateWhatsAppURL(phone: string, message: string): string {
  const formattedPhone = formatPhoneNumber(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

export function formatWhatsAppMessage(cartItems: any[]) {
  if (cartItems.length === 0) return '';
  
  // Obter data e hora atuais para o pedido
  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()} às ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;
  
  // Cabeçalho da mensagem com informações sobre o pedido
  let message = `*📋 PEDIDO - CYNTHIA MAKEUP*\n`;
  message += `*Data:* ${formattedDate}\n\n`;
  message += `Olá! Gostaria de fazer o seguinte pedido:\n\n`;
  
  let total = 0;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  // Lista detalhada de todos os produtos
  message += `*✨ ITENS DO PEDIDO:*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  cartItems.forEach((item, index) => {
    const subtotal = item.product.price * item.quantity / 100;
    total += subtotal;
    
    message += `*${index + 1}. ${item.product.name}*\n`;
    message += `• Categoria: ${item.product.category || 'N/A'}\n`;
    message += `• Marca: ${item.product.brand || 'N/A'}\n`;
    message += `• Valor unitário: ${item.product.formattedPrice}\n`;
    message += `• Quantidade: ${item.quantity} unidade${item.quantity > 1 ? 's' : ''}\n`;
    message += `• Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  });
  
  // Resumo financeiro do pedido
  message += `\n*💰 RESUMO DO PEDIDO:*\n`;
  message += `• Quantidade de itens diferentes: ${cartItems.length}\n`;
  message += `• Total de produtos: ${totalItems} unidade${totalItems > 1 ? 's' : ''}\n`;
  message += `• Valor total: *R$ ${total.toFixed(2).replace('.', ',')}*\n\n`;
  
  // Dados para entrega e conclusão
  message += `*📱 DADOS PARA CONTATO:*\n`;
  message += `Por favor, informe:\n`;
  message += `- Nome completo\n`;
  message += `- Endereço para entrega\n`;
  message += `- Telefone para confirmação\n\n`;
  
  message += `Muito obrigado pela preferência! 💖\nCynthia Makeup\n\n_Compra realizada pelo site_`;
  
  return message;
}

// Phone number validation (Brazil format)
export function isValidPhone(phone: string): boolean {
  // Basic validation for Brazilian phone numbers
  return /^(\d{2})?\d{8,9}$/.test(phone.replace(/\D/g, ''));
}

// Format price from cents to display format
export function formatPrice(priceInCents: number): string {
  return `R$ ${(priceInCents / 100).toFixed(2).replace('.', ',')}`;
}

// Parse price from display format to cents
export function parsePrice(priceDisplay: string): number {
  return Math.round(parseFloat(priceDisplay.replace(/[^\d,]/g, '').replace(',', '.')) * 100);
}

// Filter products by criteria
export function filterProducts(products: any[], filters: any) {
  return products.filter(product => {
    // Filter by category
    if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
      return false;
    }
    
    // Filter by price range
    const price = product.price;
    if (filters.priceRanges.length > 0) {
      const inPriceRange = filters.priceRanges.some((range: string) => {
        switch (range) {
          case 'under-50':
            return price < 5000;
          case '50-100':
            return price >= 5000 && price < 10000;
          case '100-200':
            return price >= 10000 && price < 20000;
          case 'over-200':
            return price >= 20000;
          default:
            return true;
        }
      });
      
      if (!inPriceRange) return false;
    }
    
    // Filter by brand
    if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
      return false;
    }
    
    return true;
  });
}

// Sort products
export function sortProducts(products: any[], sortOption: string) {
  const sortedProducts = [...products];
  
  switch (sortOption) {
    case 'price-asc':
      sortedProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      sortedProducts.sort((a, b) => b.price - a.price);
      break;
    case 'newest':
      sortedProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    // Default is 'relevance', keep the original order
    default:
      break;
  }
  
  return sortedProducts;
}
