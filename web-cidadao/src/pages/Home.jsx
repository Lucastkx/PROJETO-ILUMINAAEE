import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { Fab, Nav } from "../components/Layout";
import Logo from "../components/Logo";
import Mapa, { Legenda } from "../components/Mapa";
import { IcSeta } from "../components/Icons";

export default function Home() {
  const { usuario } = useAuth();
  const [postes, setPostes] = useState([]);
  const [chamados, setChamados] = useState([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    Promise.all([api.postes(), api.meusChamados()])
      .then(([p, c]) => { setPostes(p); setChamados(c); })
      .catch((e) => setErro(e.message));
  }, []);

  const abertos = chamados.filter((c) => c.status !== "resolvido");
  const emCaminho = abertos.filter((c) => c.status === "equipe_a_caminho").length;
  const estados = useMemo(() => {
    const m = {};
    for (const c of abertos) {
      if (!c.codigo_poste) continue;
      m[c.codigo_poste] = c.status === "equipe_a_caminho" ? "manutencao" : "problema";
    }
    return m;
  }, [chamados]);

  const nome = usuario?.nome_social || usuario?.nome?.split(" ")[0];

  return (
    <div className="shell">
      <div className="page">
        <div>
          <Logo />
          <p className="sub" style={{ marginTop: 6 }}>Olá, {nome}. Vamos iluminar Recife?</p>
        </div>
        {erro && <div className="erro" role="alert">{erro}</div>}
        <Mapa postes={postes} estados={estados} altura={320} />
        <Legenda />
        <Link to="/chamados" className="aberto">
          <span className="n">{String(abertos.length).padStart(2, "0")}</span>
          <span style={{ flex: 1 }}>
            <b>{abertos.length === 1 ? "Seu chamado em aberto" : "Seus chamados em aberto"}</b>
            <small>
              {abertos.length === 0
                ? "Nenhum poste esperando conserto."
                : emCaminho > 0
                ? `${emCaminho} ${emCaminho === 1 ? "equipe a caminho" : "equipes a caminho"}`
                : "Aguardando a equipe técnica"}
            </small>
          </span>
          <IcSeta width="20" height="20" />
        </Link>
      </div>
      <Fab />
      <Nav />
    </div>
  );
}
