import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_URL, api } from "../api";
import { Progresso, Selo } from "../components/ChamadoCard";
import { Carregando, Topo } from "../components/Layout";
import { STATUS, TIPOS, fmtDataHora } from "../util";

export default function ChamadoDetalhe() {
  const { id } = useParams();
  const [c, setC] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    api.chamado(id).then(setC).catch((e) => setErro(e.message));
  }, [id]);

  return (
    <div className="shell">
      <Topo titulo={c ? `Chamado #${c.protocolo}` : "Chamado"} voltarPara="/chamados" />
      <div className="page sem-nav">
        {erro && <div className="erro" role="alert">{erro}</div>}
        {!c && !erro && <Carregando />}
        {c && (
          <>
            <div className="linha"><h2 className="titulo espaco" style={{ fontSize: 22 }}>{TIPOS[c.tipo_problema]?.titulo}</h2><Selo status={c.status} /></div>
            <div className="card">
              <b>{c.rua}</b>
              <p className="sub">{c.bairro}, Recife{c.codigo_poste ? ` · Poste ${c.codigo_poste}` : ""}</p>
              <Progresso status={c.status} />
            </div>
            {c.descricao && <div className="card"><b>Suas observações</b><p className="sub" style={{ marginTop: 4 }}>{c.descricao}</p></div>}
            {c.fotos.length > 0 && (
              <div className="fotos">
                {c.fotos.map((f) => <div className="foto" key={f.caminho}><img src={`${API_URL}${f.caminho}`} alt="Foto enviada do poste" /></div>)}
              </div>
            )}
            <div className="card">
              <b>Andamento</b>
              <ul className="hist" style={{ marginTop: 12 }}>
                {[...c.historico].reverse().map((h, i) => (
                  <li key={i}><span className="pt" /><span className="espaco">{STATUS[h.status].rotulo}</span><span className="pequeno">{fmtDataHora(h.criado_em)}</span></li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
