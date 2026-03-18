import { useNavigate } from "react-router-dom";
import { DichosSection } from "@/components/DichosSection";

const Dichos = () => {
  const navigate = useNavigate();
  return <DichosSection onBack={() => navigate("/")} />;
};

export default Dichos;
