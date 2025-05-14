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
  return `${timestamp}${randomPart}`;
}

// ID de sessão global em memória para garantir consistência dentro da mesma sessão do navegador
let currentSessionId: string | null = null;

/**
 * Obtém o ID de sessão atual do localStorage ou cria um novo
 */
export function getSessionId(): string {
  // Se já temos um ID em memória, usamos ele para consistência
  if (currentSessionId) {
    return currentSessionId;
  }

  try {
    // Verificar se existe uma sessão no localStorage
    let storedSessionId = localStorage.getItem(SESSION_ID_KEY);
    
    // Verificar se o ID já existe e é válido
    if (storedSessionId && storedSessionId.length > 10) {
      console.log('[SessionManager] Usando ID de sessão existente:', storedSessionId);
      currentSessionId = storedSessionId;
      return storedSessionId;
    } else {
      // Gerar um novo ID de sessão
      const newSessionId = generateNewSessionId();
      console.log('[SessionManager] Criando novo ID de sessão:', newSessionId);
      
      // Salvar no localStorage e no estado em memória
      try {
        localStorage.setItem(SESSION_ID_KEY, newSessionId);
        currentSessionId = newSessionId;
        console.log('[SessionManager] ID de sessão salvo no localStorage');
      } catch (storageError) {
        console.error('[SessionManager] Erro ao salvar ID de sessão no localStorage:', storageError);
      }
      
      return newSessionId;
    }
  } catch (error) {
    console.error('[SessionManager] Erro ao inicializar ID de sessão:', error);
    
    // Fallback - criar um ID temporário mesmo se houver erro
    if (!currentSessionId) {
      currentSessionId = `fallback_${Date.now()}`;
    }
    return currentSessionId;
  }
}

/**
 * Limpa o ID de sessão atual
 */
export function clearSessionId(): void {
  try {
    localStorage.removeItem(SESSION_ID_KEY);
    currentSessionId = null; // Limpa também da memória
    console.log('[SessionManager] ID de sessão removido');
  } catch (error) {
    console.error('[SessionManager] Erro ao remover ID de sessão:', error);
  }
}

/**
 * Função para obter o ID de sessão ativo
 * Sempre usa o mesmo ID durante toda a sessão do navegador
 */
export function getActiveSessionId(): string {
  return getSessionId();
}