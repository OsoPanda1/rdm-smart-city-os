import { useState } from "react";
import { SovereignSidebar } from "@/components/SovereignSidebar";
import { RealitoOrb } from "@/components/RealitoOrb";
import { DashboardView } from "@/components/DashboardView";
import { ExplorerView } from "@/components/ExplorerView";
import { RoutesView } from "@/components/RoutesView";
import { CommerceView } from "@/components/CommerceView";
import { HeritageView } from "@/components/HeritageView";
import { TelemetryView } from "@/components/TelemetryView";

const VIEWS: Record<string, React.ComponentType> = {
  dashboard: DashboardView,
  explorer: ExplorerView,
  routes: RoutesView,
  commerce: CommerceView,
  heritage: HeritageView,
  telemetry: TelemetryView,
};

const Index = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const ViewComponent = VIEWS[activeView] || DashboardView;

  return (
    <div className="min-h-screen bg-background">
      <SovereignSidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="ml-[220px] p-6 pb-24 max-w-6xl">
        <ViewComponent />
      </main>
      <RealitoOrb />
    </div>
  );
};

export default Index;
