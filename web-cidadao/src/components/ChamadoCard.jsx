import { Link } from "react-router-dom";
import { IcSeta } from "./Icons";
import { STATUS, TIPOS, fmtData, fmtDataHora } from "../util";

export function Progresso({ status }) {
  const n = STATUS[status].ordem;
  const cls = status === "resolvido" ? "ok" : status === "equipe_a_caminho" ? "manut" : "";
  return (
    <div className={`prog ${cls}`} aria-label={`Andamento: ${STATUS[status].rotulo}`}>
      <div className={n >= 0 ? "on" : ""}>Recebido</div>
      <div className={n >= 1 ? "on" : ""}>Equipe a caminho</div>
      <div className={n >= 2 ? "on" : ""}>Resolvido</div>
    </div>
  );
}

export function Selo({ status }) {
  return <span className={`selo ${status}`}>{STATUS[status].rotulo}</span>;
}

export function ultimaAtualizacao(c) {
  const h = c.historico[c.historico.length - 1];
  const quando = h ? fmtDataHora(h.criado_em) : fmtDataHora(c.atualizado_em);
  return `${STATUS[c.status].rotulo} em ${quando}`;
}

export default function ChamadoCard({ c }) {
  return (
    <Link to={`/chamados/${c.id}`} className="card clicavel" style={{ textDecoration: "none", color: "inherit", fontWeight: 400 }}>
      <div className="linha" style={{ marginBottom: 6 }}>
        <span className="pequeno" style={{ fontWeight: 600 }}>#{c.protocolo}</span>
        <span className="espaco" />
        <Selo status={c.status} />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 800 }}>{TIPOS[c.tipo_problema]?.titulo ?? c.tipo_problema}</h3>
      <p className="sub">{c.rua} · {c.bairro}</p>
      <p className="pequeno">{fmtData(c.criado_em)}{c.codigo_poste ? ` · Poste ${c.codigo_poste}` : ""}</p>
      <Progresso status={c.status} />
      <div className="linha" style={{ marginTop: 10 }}>
        <span className="pequeno espaco">{ultimaAtualizacao(c)}</span>
        <IcSeta width="16" height="16" />
      </div>
    </Link>
  );
}
