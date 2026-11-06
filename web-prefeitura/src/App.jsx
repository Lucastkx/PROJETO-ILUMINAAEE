import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth";
import Login from "./pages/Login";
import Painel from "./pages/Painel";

export default function App() {
  const { usuario, carregando } = useAuth();
  if (carregando) return <p className="sub" style={{ padding: 40 }}>Carregando…</p>;
  return (
    <Routes>
      <Route path="/login" element={usuario ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={usuario ? <Painel /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
