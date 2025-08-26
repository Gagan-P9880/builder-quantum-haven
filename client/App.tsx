import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Placeholder from "./pages/Placeholder";
import NotFound from "./pages/NotFound";
import { Shield, Settings } from "lucide-react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<Admin />} />
          <Route
            path="/rfid"
            element={
              <Placeholder
                title="RFID Monitor"
                description="Detailed RFID access monitoring and card management system"
                icon={<Shield className="h-8 w-8 text-primary" />}
              />
            }
          />
          <Route
            path="/dos"
            element={
              <Placeholder
                title="DoS Protection"
                description="Advanced Denial of Service attack detection and mitigation controls"
                icon={<Shield className="h-8 w-8 text-destructive" />}
              />
            }
          />
          <Route
            path="/settings"
            element={
              <Placeholder
                title="System Settings"
                description="Configure security parameters, user management, and system preferences"
                icon={<Settings className="h-8 w-8 text-muted-foreground" />}
              />
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
