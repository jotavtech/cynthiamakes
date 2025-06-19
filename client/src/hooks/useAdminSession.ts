import { useEffect, useCallback } from 'react';
import { useAdmin } from './useAdmin';
import { useToast } from '@/hooks/use-toast';

export const useAdminSession = () => {
  const { user, logout } = useAdmin();
  const { toast } = useToast();

  // Função simplificada que sempre retorna true - sem verificação de expiração
  const checkSession = useCallback(async () => {
    // Sempre retorna true - não há mais verificação de expiração
    return true;
  }, []);

  // Função simplificada que não faz logout automático
  const handleApiError = useCallback((error: any) => {
    const status = error?.response?.status || error?.status;
    const errorData = error?.response?.data || error?.data || {};
    
    // Apenas mostrar erro, mas não fazer logout automático
    if (status === 401 || errorData?.code === 'SESSION_EXPIRED') {
      toast({
        title: "Erro de Conexão",
        description: "Erro na comunicação com o servidor. Tente novamente.",
        variant: "destructive",
      });
    } else if (status === 403 || errorData?.code === 'ADMIN_REQUIRED') {
      toast({
        title: "Acesso Negado",
        description: "Você precisa ser administrador para realizar esta ação.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Não há mais useEffect para verificar sessão periodicamente
  // O usuário permanece logado indefinidamente

  return { checkSession, handleApiError };
}; 