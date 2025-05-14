import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";

export const useAdmin = () => {
  const { toast } = useToast();
  
  // Busca o usuário atualmente autenticado
  const { 
    data: user, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/user'],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Mutation para fazer login
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['/api/user'], user);
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
