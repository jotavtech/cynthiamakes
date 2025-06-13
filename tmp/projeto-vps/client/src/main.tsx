import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { CartProvider } from "./context/CartContext";
import { AdminProvider } from "./context/AdminContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AdminProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AdminProvider>
  </QueryClientProvider>
);
