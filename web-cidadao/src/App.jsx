import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth";
import Cadastro from "./pages/Cadastro";
import ChamadoDetalhe from "./pages/ChamadoDetalhe";
import EsqueciSenha from "./pages/EsqueciSenha";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MeusChamados from "./pages/MeusChamados";
import NovoChamado from "./pages/NovoChamado";
import Perfil from "./pages/Perfil";

function Privado() {
  const { usuario, carregando } = useAuth();
  if (carregando) return <div className="shell"><p className="sub centro" style={{ padding: 40 }}>Carregando…</p></div>;
  return usuario ? <Outlet /> : <Navigate to="/login" replace />;
}

function Publico() {
  const { usuario, carregando } = useAuth();
  if (carregando) return null;
  return usuario ? <Navigate to="/" replace /> : <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Publico />}>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/esqueci-senha" element={<EsqueciSenha />} />
      </Route>
      <Route element={<Privado />}>
        <Route path="/" element={<Home />} />
        <Route path="/novo" element={<NovoChamado />} />
        <Route path="/chamados" element={<MeusChamados />} />
        <Route path="/chamados/:id" element={<ChamadoDetalhe />} />
        <Route path="/perfil" element={<Perfil />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
