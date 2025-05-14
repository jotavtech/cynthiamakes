import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAdmin } from "@/hooks/useAdmin";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import AdminPanel from "@/components/admin/AdminPanel";
import { Helmet } from "react-helmet";

const AdminPage = () => {
  const { user, isLoading } = useAdmin();
  const [_, setLocation] = useLocation();

  // Redirect to home if admin attempts to access admin page without logging in
  useEffect(() => {
    if (!isLoading && !user) {
      // Don't redirect, just show login form
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Área Administrativa - Cynthia Makeup</title>
        <meta name="description" content="Área administrativa para gerenciamento de produtos e conteúdo." />
      </Helmet>
      
      <div className="min-h-screen bg-light py-12">
        <div className="container mx-auto px-4">
          {user ? (
            <AdminPanel />
          ) : (
            <div className="max-w-md mx-auto">
              <AdminLoginForm />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminPage;
