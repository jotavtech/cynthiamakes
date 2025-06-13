// Configuração centralizada do WhatsApp
export const WHATSAPP_CONFIG = {
  // Número da Cynthia Makeup (conforme solicitado pelo usuário)
  PHONE_NUMBER: "5583988382886", // +55 83 98838-2886 formatado para WhatsApp
  BUSINESS_NAME: "Cynthia Makeup",
  WEBSITE_SOURCE: "site cynthiamakes"
};

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

// Formatar mensagem do carrinho para WhatsApp
export function formatWhatsAppMessage(cartItems: any[]) {
  if (cartItems.length === 0) return '';
  
  // Obter data e hora atuais para o pedido
  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()} às ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;
  
  // Cabeçalho da mensagem com informações sobre o pedido
  let message = `*📋 PEDIDO - ${WHATSAPP_CONFIG.BUSINESS_NAME.toUpperCase()}*\n`;
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
  
  message += `Muito obrigado pela preferência! 💖\n${WHATSAPP_CONFIG.BUSINESS_NAME}\n\n_Compra realizada pelo ${WHATSAPP_CONFIG.WEBSITE_SOURCE}_`;
  
  return message;
}

// Formatar mensagem de contato para WhatsApp
export function formatContactMessage(data: {
  nome: string;
  email: string;
  telefone: string;
  mensagem: string;
}) {
  return `*Contato pelo site ${WHATSAPP_CONFIG.BUSINESS_NAME}*

*Nome:* ${data.nome}
*Email:* ${data.email}
*Telefone:* ${data.telefone}

*Mensagem:*
${data.mensagem}

_Mensagem enviada pelo ${WHATSAPP_CONFIG.WEBSITE_SOURCE}_`;
}

// Função para enviar mensagem via WhatsApp
export function sendWhatsAppMessage(message: string) {
  const whatsappUrl = generateWhatsAppURL(WHATSAPP_CONFIG.PHONE_NUMBER, message);
  window.open(whatsappUrl, '_blank');
}

// Phone number validation (Brazil format)
export function isValidPhone(phone: string): boolean {
  // Basic validation for Brazilian phone numbers
  return /^(\d{2})?\d{8,9}$/.test(phone.replace(/\D/g, ''));
} 