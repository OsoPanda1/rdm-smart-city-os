import { SovereignPageShell } from "@/components/SovereignPageShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RDM_BUSINESS_CATEGORIES } from "@/lib/business-catalog";

const Catalogo = () => {
  return (
    <SovereignPageShell
      eyebrow="RDM Digital Commerce"
      title="Catálogo de Comercios RDM Digital"
      description="Directorio por categorías para negocios registrados, con estructura escalable para nuevas secciones y futura analítica inteligente."
      bullets={[
        "Agrupación clara por rubro comercial para navegación ágil.",
        "Preparado para onboarding de negocios con validación por categoría.",
        "Diseño premium con consistencia visual para cada tarjeta de comercio.",
      ]}
    >
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {RDM_BUSINESS_CATEGORIES.map((category) => (
          <Card key={category.id} className="glass border-border/70 h-full">
            <CardHeader className="pb-2">
              <Badge variant="outline" className="w-fit border-primary/30 text-primary">{category.id}</Badge>
              <CardTitle className="text-xl flex items-center gap-2">
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/75 leading-relaxed">{category.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </SovereignPageShell>
  );
};

export default Catalogo;
