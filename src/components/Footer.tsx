import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border/60 mt-20">
      <div className="container mx-auto px-4 md:px-8 py-10 flex flex-col md:flex-row gap-4 justify-between text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} TAMV Digital Nexus · Sovereign-Crystal v5.2</p>
        <div className="flex flex-wrap gap-4">
          <Link to="/reglamento" className="hover:text-foreground transition-colors">Reglamento</Link>
          <Link to="/comunidad" className="hover:text-foreground transition-colors">Comunidad</Link>
          <Link to="/auth" className="hover:text-foreground transition-colors">Acceso</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
