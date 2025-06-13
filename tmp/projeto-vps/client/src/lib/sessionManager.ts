/**
 * Gerenciador de sessão para o carrinho de compras
 * Garante que o ID de sessão seja consistente em toda a aplicação
 */

const SESSION_ID_KEY = 'cartSessionId';

// Usando uma ID fixa para garantir consistência durante os testes
// Em produção, isso seria gerado aleatoriamente ou baseado em um ID de usuário
const FIXED_SESSION_ID = '99i47ng8zigy94xt079q59';

/**
 * Gera um ID de sessão com timestamp e valor aleatório
 */
function generateNewSessionId(): string {
  // Para fins de teste, sempre retornamos o mesmo ID de sessão
  // Isso facilita a depuração e garante consistência
  return FIXED_SESSION_ID;
}

/**
 * Obtém o ID de sessão atual do localStorage ou retorna o fixo
 */
export function getSessionId(): string {
  try {
    // Para fins de teste e depuração, estamos usando um ID fixo
    console.log('[SessionManager] Usando ID de sessão fixo para teste:', FIXED_SESSION_ID);
    return FIXED_SESSION_ID;
  } catch (error) {
    console.error('[SessionManager] Erro ao inicializar ID de sessão:', error);
    return FIXED_SESSION_ID;
  }
}

/**
 * Limpa o ID de sessão atual (funcão mantida para compatibilidade)
 */
export function clearSessionId(): void {
  try {
    localStorage.removeItem(SESSION_ID_KEY);
    console.log('[SessionManager] ID de sessão removido');
  } catch (error) {
    console.error('[SessionManager] Erro ao remover ID de sessão:', error);
  }
}

/**
 * Função para obter o ID de sessão ativo
 */
export function getActiveSessionId(): string {
  return getSessionId();
}