
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import * as React from "react";
import AppRoutes from "./AppRoutes";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";

// Create QueryClient inside the component
const App = () => {
  // Create a client instance inside the component
  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <SupabaseAuthProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </SupabaseAuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
