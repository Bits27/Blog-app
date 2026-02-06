import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "../lib/auth";

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    signOut().finally(() => navigate("/login"));
  }, [navigate]);

  return <p>Logging out...</p>;
}

export default Logout;
