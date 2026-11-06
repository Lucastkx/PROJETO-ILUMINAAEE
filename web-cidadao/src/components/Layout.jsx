import { NavLink, useNavigate } from "react-router-dom";
import { IcHome, IcLista, IcPlus, IcUser, IcVoltar } from "./Icons";

export function Nav() {
  const item = ({ isActive }) => (isActive ? "ativo" : "");
  return (
    <nav className="nav" aria-label="Principal">
      <NavLink to="/" end className={item}><IcHome />Início</NavLink>
      <NavLink to="/chamados" className={item}><IcLista />Meus chamados</NavLink>
      <NavLink to="/perfil" className={item}><IcUser />Perfil</NavLink>
    </nav>
  );
}

export function Topo({ titulo, voltarPara, direita }) {
  const nav = useNavigate();
  return (
    <header className="topo">
      <button className="icone-btn" aria-label="Voltar" onClick={() => (voltarPara ? nav(voltarPara) : nav(-1))}>
        <IcVoltar />
      </button>
      <h1>{titulo}</h1>
      <div style={{ minWidth: 40, textAlign: "right" }}>{direita}</div>
    </header>
  );
}

export function Fab() {
  return (
    <NavLink to="/novo" className="fab" aria-label="Novo chamado"><IcPlus /></NavLink>
  );
}

export function Carregando({ texto = "Carregando…" }) {
  return <p className="sub centro" style={{ padding: 32 }}>{texto}</p>;
}
