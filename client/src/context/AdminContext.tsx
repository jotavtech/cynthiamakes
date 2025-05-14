import {
  createContext,
  useState,
  useEffect,
  ReactNode
} from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  isAdmin: boolean;
}

interface AdminContextType {
  user: User | null;
  isLoading: boolean;
  isLoggingIn: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AdminContext = createContext<AdminContextType>({
  user: null,
  isLoading: false,
  isLoggingIn: false,
  login: async () => {},
  logout: async () => {},
});

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider = ({ children }: AdminProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const storedUser = localStorage.getItem('adminUser');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoggingIn(true);
    try {
      const response = await apiRequest("POST", "/api/login", { username, password });
      const userData = await response.json();
      
      if (!userData.isAdmin) {
        throw new Error("Acesso negado. Apenas administradores podem acessar esta área.");
      }
      
      setUser(userData);
      localStorage.setItem('adminUser', JSON.stringify(userData));
      
      toast({
        title: "Login bem-sucedido",
        description: `Bem-vindo(a), ${userData.username}!`,
      });
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message || "Credenciais inválidas. Por favor, tente novamente.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      localStorage.removeItem('adminUser');
      
      toast({
        title: "Logout realizado",
        description: "Você saiu da sua conta com sucesso.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Erro",
        description: "Não foi possível realizar o logout. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminContext.Provider
      value={{
        user,
        isLoading,
        isLoggingIn,
        login,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
