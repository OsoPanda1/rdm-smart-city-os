import { InteractiveMap } from "@/components/InteractiveMap";
import { FloatingNav } from "@/components/FloatingNav";
import { RealitoOrb } from "@/components/RealitoOrb";

const Mapa = () => {
  return (
    <div className="min-h-screen bg-background">
      <FloatingNav />
      <div className="pt-4">
        <InteractiveMap />
      </div>
      <RealitoOrb />
    </div>
  );
};

export default Mapa;
