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
    initialData: getStoredUser()
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
      queryClient.setQueryData(['/api/user'], null);
      
      // Remover dados do AdminContext
      localStorage.removeItem('adminUser');
      
      toast({
        title: "Logout realizado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Falha ao fazer logout",
        description: error.message,
        variant: "destructive",
      });
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
