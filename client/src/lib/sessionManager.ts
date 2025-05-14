/**
 * Gerenciador de sessão para o carrinho de compras
 * Garante que o ID de sessão seja consistente em toda a aplicação
 */

const SESSION_ID_KEY = 'cartSessionId';

/**
 * Gera um ID de sessão com timestamp e valor aleatório
 */
function generateNewSessionId(): string {
  const timestamp = new Date().getTime();
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `cart_${timestamp}_${randomPart}`;
}

/**
 * Obtém o ID de sessão atual do localStorage ou cria um novo
 */
export function getSessionId(): string {
  try {
    // Verificar se existe uma sessão no localStorage
    let storedSessionId = localStorage.getItem(SESSION_ID_KEY);
    
    // Verificar se o ID já existe e é válido
    if (storedSessionId && storedSessionId.length > 10) {
      console.log('Usando ID de sessão existente:', storedSessionId);
      return storedSessionId;
    } else {
      // Gerar um novo ID de sessão
      const newSessionId = generateNewSessionId();
      console.log('Criando novo ID de sessão:', newSessionId);
      
      // Salvar no localStorage
      try {
        localStorage.setItem(SESSION_ID_KEY, newSessionId);
        console.log('ID de sessão salvo no localStorage');
      } catch (storageError) {
        console.error('Erro ao salvar ID de sessão no localStorage:', storageError);
      }
      
      return newSessionId;
    }
  } catch (error) {
    console.error('Erro ao inicializar ID de sessão:', error);
    
    // Fallback - criar um ID temporário mesmo se houver erro
    const fallbackId = `fallback_${Date.now()}`;
    return fallbackId;
  }
}

/**
 * Limpa o ID de sessão atual
 */
export function clearSessionId(): void {
  try {
    localStorage.removeItem(SESSION_ID_KEY);
    console.log('ID de sessão removido');
  } catch (error) {
    console.error('Erro ao remover ID de sessão:', error);
  }
}

// Exporta o ID de sessão como constante para uso global
export const SESSION_ID = getSessionId();