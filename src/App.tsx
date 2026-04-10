import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Apoya from "./pages/Apoya.tsx";
import Arte from "./pages/Arte.tsx";
import Auth from "./pages/Auth.tsx";
import Catalogo from "./pages/Catalogo.tsx";
import Comunidad from "./pages/Comunidad.tsx";
import Cultura from "./pages/Cultura.tsx";
import Dichos from "./pages/Dichos.tsx";
import Directorio from "./pages/Directorio.tsx";
import Ecoturismo from "./pages/Ecoturismo.tsx";
import Eventos from "./pages/Eventos.tsx";
import Gastronomia from "./pages/Gastronomia.tsx";
import Historia from "./pages/Historia.tsx";
import Lugares from "./pages/Lugares.tsx";
import Mapa from "./pages/Mapa.tsx";
import NegociosPortal from "./pages/NegociosPortal.tsx";
import Reglamento from "./pages/Reglamento.tsx";
import Relatos from "./pages/Relatos.tsx";
import Rutas from "./pages/Rutas.tsx";
import Comercios from "./pages/Comercios.tsx";
import Paquetes from "./pages/Paquetes.tsx";
import ComunidadPage from "./pages/ComunidadPage.tsx";
import TransporteLocal from "./pages/TransporteLocal.tsx";
import ShuttleCDMX from "./pages/ShuttleCDMX.tsx";
import Atlas from "./pages/Atlas.tsx";
import Guardian from "./pages/Guardian.tsx";
import DevHub from "./pages/DevHub.tsx";
import Federation from "./pages/Federation.tsx";
import { enforceIvoryBackground } from "@/lib/design-guardrails";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    enforceIvoryBackground();
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/apoya" element={<Apoya />} />
          <Route path="/arte" element={<Arte />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/comunidad" element={<ComunidadPage />} />
          <Route path="/cultura" element={<Cultura />} />
          <Route path="/dichos" element={<Dichos />} />
          <Route path="/directorio" element={<Directorio />} />
          <Route path="/ecoturismo" element={<Ecoturismo />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/gastronomia" element={<Gastronomia />} />
          <Route path="/historia" element={<Historia />} />
          <Route path="/lugares" element={<Lugares />} />
          <Route path="/mapa" element={<Mapa />} />
          <Route path="/explorar" element={<Mapa />} />
          <Route path="/experiencias" element={<Rutas />} />
          <Route path="/patrimonio" element={<Cultura />} />
          <Route path="/sabores" element={<Gastronomia />} />
          <Route path="/economia" element={<NegociosPortal />} />
          <Route path="/planificador" element={<Rutas />} />
          <Route path="/realito" element={<Dashboard />} />
          <Route path="/negocios-portal" element={<NegociosPortal />} />
          <Route path="/comercios" element={<Comercios />} />
          <Route path="/paquetes" element={<Paquetes />} />
          <Route path="/transporte-local" element={<TransporteLocal />} />
          <Route path="/shuttle-cdmx-rdm" element={<ShuttleCDMX />} />
          <Route path="/reglamento" element={<Reglamento />} />
          <Route path="/relatos" element={<Relatos />} />
          <Route path="/rutas" element={<Rutas />} />
          {/* TAMV Civilizational Core Routes */}
          <Route path="/atlas" element={<Atlas />} />
          <Route path="/guardian" element={<Guardian />} />
           <Route path="/devhub" element={<DevHub />} />
           <Route path="/federation" element={<Federation />} />
          <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;
