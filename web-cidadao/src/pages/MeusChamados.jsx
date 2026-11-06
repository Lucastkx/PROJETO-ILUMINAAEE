import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import ChamadoCard from "../components/ChamadoCard";
import { IcLampada, IcPlus } from "../components/Icons";
import { Carregando, Nav } from "../components/Layout";

export default function MeusChamados() {
  const [chamados, setChamados] = useState(null);
  const [aba, setAba] = useState("todos");
  const [erro, setErro] = useState("");

  useEffect(() => {
    api.meusChamados().then(setChamados).catch((e) => setErro(e.message));
  }, []);

  const abertos = chamados?.filter((c) => c.status !== "resolvido") ?? [];
  const resolvidos = chamados?.filter((c) => c.status === "resolvido") ?? [];
  const lista = aba === "abertos" ? abertos : aba === "resolvidos" ? resolvidos : chamados ?? [];

  return (
    <div className="shell">
      <div className="page">
        <div className="linha">
          <div className="espaco">
            <h1 className="titulo">Meus chamados</h1>
            <p className="sub">Cada chamado faz a diferença.</p>
          </div>
          <Link to="/novo" className="icone-btn" style={{ background: "var(--amber)", width: 48, height: 48 }} aria-label="Novo chamado"><IcPlus /></Link>
        </div>
        <div className="abas" role="group" aria-label="Filtrar chamados">
          <button className="aba" aria-pressed={aba === "todos"} onClick={() => setAba("todos")}>Todos {chamados?.length ?? ""}</button>
          <button className="aba" aria-pressed={aba === "abertos"} onClick={() => setAba("abertos")}>Em aberto {chamados ? abertos.length : ""}</button>
          <button className="aba" aria-pressed={aba === "resolvidos"} onClick={() => setAba("resolvidos")}>Resolvidos {chamados ? resolvidos.length : ""}</button>
        </div>
        {erro && <div className="erro" role="alert">{erro}</div>}
        {!chamados && !erro && <Carregando />}
        {chamados && lista.length === 0 && (
          <div className="vazio">
            <IcLampada />
            <p>{aba === "todos" ? "Você ainda não abriu nenhum chamado." : "Nenhum chamado nesta lista."}</p>
            <Link to="/novo" className="btn amber" style={{ textDecoration: "none", width: "auto", display: "inline-block" }}>Abrir um chamado</Link>
          </div>
        )}
        {lista.map((c) => <ChamadoCard key={c.id} c={c} />)}
      </div>
      <Nav />
    </div>
  );
}
