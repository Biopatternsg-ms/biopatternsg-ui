import { useNavigate } from "react-router-dom";
import { Avatar } from "@/components/atoms/Avatar";
import { Button } from "@/components/atoms/Button";
import { clearSession } from "@/services/authService";

const UserMenu = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate("/");
  };

  return (
    <div className="flex items-center gap-3">
      <Avatar />
      <Button variant="ghost" size="md" onClick={handleLogout}>
        Cerrar sesión
      </Button>
    </div>
  );
};

export { UserMenu };
