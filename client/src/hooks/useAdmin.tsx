import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";

export function useAdmin() {
  const { toast } = useToast();
  
  // Verifica se existe um usuário no localStorage (para compatibilidade com AdminContext)
  const getStoredUser = () => {
    try {
      const storedUser = localStorage.getItem('adminUser');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error reading adminUser from localStorage:", error);
      return null;
    }
  };

  // Busca o usuário atualmente autenticado
  const { 
    data: user, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/user'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    initialData: getStoredUser(),
    refetchInterval: false, // Não refetch automaticamente
    refetchOnWindowFocus: false, // Não refetch quando a janela ganha foco
    staleTime: 5 * 60 * 1000, // Dados válidos por 5 minutos
    gcTime: 10 * 60 * 1000, // Manter em cache por 10 minutos
  });

  // Mutation para fazer login
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['/api/user'], user);
      
      // Compatibilidade com AdminContext
      if (user.isAdmin) {
        localStorage.setItem('adminUser', JSON.stringify(user));
        
        // Removido redirecionamento automático - deixar o React Router lidar com isso
        // window.location.href = '/admin';
      }
      
      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Falha no login",
        description: "Usuário ou senha inválidos",
        variant: "destructive",
      });
    },
  });

  // Mutation para fazer logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      // Limpar cache do React Query
      queryClient.clear();
      
      // Limpar dados locais
      queryClient.setQueryData(['/api/user'], null);
      localStorage.removeItem('adminUser');
      
      // Forçar redirecionamento para a página inicial
      window.location.href = '/';
      
      toast({
        title: "Logout realizado com sucesso",
      });
    },
    onError: (error: Error) => {
      console.error("Erro no logout:", error);
      
      // Mesmo com erro, limpar dados locais e redirecionar
      localStorage.removeItem('adminUser');
      queryClient.setQueryData(['/api/user'], null);
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado do sistema.",
      });
      
      // Redirecionar para página inicial
      window.location.href = '/';
    },
  });
  
  return {
    user: user ?? null,
    isLoading,
    error,
    login: (username: string, password: string) => loginMutation.mutateAsync({ username, password }),
    logout: () => logoutMutation.mutateAsync(),
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending
  };
};
