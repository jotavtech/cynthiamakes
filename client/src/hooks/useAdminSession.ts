import { useEffect, useCallback } from 'react';
import { useAdmin } from './useAdmin';
import { useToast } from '@/hooks/use-toast';

const SESSION_DURATION = 30 * 60 * 1000; // 30 minutos em ms
const CHECK_INTERVAL = 30 * 1000; // Verificar a cada 30 segundos
const INITIAL_DELAY = 5 * 1000; // Aguardar 5 segundos antes da primeira verificação

export const useAdminSession = () => {
  const { user, logout } = useAdmin();
  const { toast } = useToast();

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/status', {
        credentials: 'include'
      });
      
      if (response.status === 401) {
        // Sessão expirou
        toast({
          title: "Sessão Expirada",
          description: "Sua sessão administrativa expirou (30 min). Você será redirecionado para o login.",
          variant: "destructive",
        });
        
        setTimeout(() => {
          logout();
        }, 2000);
        
        return false;
      }
      
      if (response.status === 403) {
        // Usuário não é admin
        toast({
          title: "Acesso Negado",
          description: "Você não tem permissões de administrador.",
          variant: "destructive",
        });
        
        setTimeout(() => {
          logout();
        }, 2000);
        
        return false;
      }
      
      return response.ok;
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      return false;
    }
  }, [logout, toast]);

  // Interceptar erros de API para detectar sessão expirada
  const handleApiError = useCallback((error: any) => {
    const status = error?.response?.status || error?.status;
    const errorData = error?.response?.data || error?.data || {};
    
    if (status === 401 || errorData?.code === 'SESSION_EXPIRED') {
      toast({
        title: "Sessão Expirada",
        description: "Sua sessão administrativa expirou (30 min). Faça login novamente.",
        variant: "destructive",
      });
      
      setTimeout(() => {
        logout();
      }, 2000);
    } else if (status === 403 || errorData?.code === 'ADMIN_REQUIRED') {
      toast({
        title: "Acesso Negado",
        description: "Você precisa ser administrador para realizar esta ação.",
        variant: "destructive",
      });
      
      setTimeout(() => {
        logout();
      }, 2000);
    }
  }, [logout, toast]);

  useEffect(() => {
    if (!user?.isAdmin) return;

    // Aguardar um tempo inicial antes de começar a verificar a sessão
    const initialTimer = setTimeout(() => {
      // Verificar sessão periodicamente
      const intervalId = setInterval(checkSession, CHECK_INTERVAL);

      // Limpar interval quando o componente desmonta ou usuário não é mais admin
      return () => {
        clearInterval(intervalId);
      };
    }, INITIAL_DELAY);

    // Limpar timer inicial quando o componente desmonta
    return () => {
      clearTimeout(initialTimer);
    };
  }, [user?.isAdmin, checkSession]);

  return { checkSession, handleApiError };
}; 