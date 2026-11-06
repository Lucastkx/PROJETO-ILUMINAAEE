import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { API_URL, api } from "../api";
import { useAuth } from "../auth";
import Logo from "../components/Logo";
import Mapa from "../components/Mapa";
import { STATUS, TIPOS, estadoPin, fmtDataHora, haQuanto } from "../util";

const FILTROS = [["abertos", "Em aberto"], ["todos", "Todos"], ["resolvido", "Resolvidos"]];

function ordenar(a, b) {
  const aberto = (c) => (c.status === "resolvido" ? 1 : 0);
  if (aberto(a) !== aberto(b)) return aberto(a) - aberto(b);
  if (a.urgencia !== b.urgencia) return a.urgencia === "alta" ? -1 : 1;
  return b.criado_em.localeCompare(a.criado_em);
}

function Item({ c, ativo, onClick }) {
  return (
    <button className={`item ${ativo ? "ativo" : ""}`} onClick={onClick} aria-pressed={ativo}>
      <span className={`ponto ${estadoPin[c.status]}`} aria-hidden="true" />
      <span className="espaco">
        <b>{TIPOS[c.tipo_problema]}</b>
        <small>{c.rua} · {c.bairro}</small>
        <small>#{c.protocolo} · {haQuanto(c.criado_em + "")}</small>
      </span>
      <span className="direita">
        {c.urgencia === "alta" && c.status !== "resolvido" && <span className="selo urgente">Urgente</span>}
        <span className={`selo ${c.status}`}>{STATUS[c.status]}</span>
        {!c.latitude && <small>sem local no mapa</small>}
      </span>
    </button>
  );
}

function Detalhe({ c, onFechar, onAtualizar, salvando }) {
  const aberto = c.status !== "resolvido";
  return (
    <div className="detalhe">
      <button className="btn link" style={{ alignSelf: "flex-start", padding: 0 }} onClick={onFechar}>‹ Voltar à lista</button>
      <div className="linha">
        <div className="espaco">
          <p className="pequeno">Protocolo #{c.protocolo}</p>
          <h2 className="titulo-d">{TIPOS[c.tipo_problema]}</h2>
        </div>
        <span className={`selo ${c.status}`}>{STATUS[c.status]}</span>
      </div>

      <dl className="dados">
        <div><dt>Endereço</dt><dd>{c.rua}{c.numero_proximo ? `, próx. ao nº ${c.numero_proximo}` : ""}</dd></div>
        <div><dt>Bairro</dt><dd>{c.bairro}</dd></div>
        <div><dt>Poste</dt><dd>{c.codigo_poste || "Não informado"}</dd></div>
        <div><dt>Lâmpada</dt><dd>{c.tem_lampada ? "Instalada" : "Ausente"}</dd></div>
        <div><dt>Energia</dt><dd>{c.sem_energia ? "Rua sem energia" : "Com energia"}</dd></div>
        <div><dt>Aberto em</dt><dd>{fmtDataHora(c.criado_em)}</dd></div>
      </dl>

      {c.descricao && <div className="obs"><b>Observação do cidadão</b><p>{c.descricao}</p></div>}

      {c.fotos.length > 0 && (
        <div className="fotos-d">
          {c.fotos.map((f) => (
            <a key={f.caminho} href={`${API_URL}${f.caminho}`} target="_blank" rel="noreferrer"><img src={`${API_URL}${f.caminho}`} alt="Foto do poste enviada pelo cidadão" /></a>
          ))}
        </div>
      )}

      <div>
        <b>Andamento</b>
        <ul className="hist">
          {[...c.historico].reverse().map((h, i) => (
            <li key={i}><span className="pt" /><span className="espaco">{STATUS[h.status]}</span><span className="pequeno">{fmtDataHora(h.criado_em)}</span></li>
          ))}
        </ul>
      </div>

      <div className="acoes">
        {c.status === "recebido" && <button className="btn" disabled={salvando} onClick={() => onAtualizar(c.id, { status: "equipe_a_caminho" })}>Enviar equipe</button>}
        {c.status === "equipe_a_caminho" && <button className="btn ok" disabled={salvando} onClick={() => onAtualizar(c.id, { status: "resolvido" })}>Finalizar chamado</button>}
        {c.status === "resolvido" && <button className="btn claro" disabled={salvando} onClick={() => onAtualizar(c.id, { status: "recebido" })}>Reabrir chamado</button>}
        {aberto && (
          <button className="btn claro" disabled={salvando} onClick={() => onAtualizar(c.id, { urgencia: c.urgencia === "alta" ? "normal" : "alta" })}>
            {c.urgencia === "alta" ? "Remover urgência" : "Marcar como urgente"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Painel() {
  const { usuario, sair } = useAuth();
  const [chamados, setChamados] = useState([]);
  const [carregou, setCarregou] = useState(false);
  const [erro, setErro] = useState("");
  const [filtro, setFiltro] = useState("abertos");
  const [bairro, setBairro] = useState("");
  const [soUrgentes, setSoUrgentes] = useState(false);
  const [selId, setSelId] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState("");
  const conhecidos = useRef(null);

  const carregar = useCallback(async () => {
    try {
      const lista = await api.chamados();
      const ids = new Set(lista.map((c) => c.id));
      if (conhecidos.current) {
        const novos = lista.filter((c) => !conhecidos.current.has(c.id));
        if (novos.length) setAviso(novos.length === 1 ? `Novo chamado #${novos[0].protocolo} em ${novos[0].bairro}` : `${novos.length} novos chamados recebidos`);
      }
      conhecidos.current = ids;
      setChamados(lista);
      setErro("");
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregou(true);
    }
  }, []);

  useEffect(() => {
    carregar();
    const t = setInterval(carregar, 15000); // atualiza sozinho a cada 15 s
    return () => clearInterval(t);
  }, [carregar]);

  useEffect(() => { if (aviso) { const t = setTimeout(() => setAviso(""), 6000); return () => clearTimeout(t); } }, [aviso]);

  const bairros = useMemo(() => [...new Set(chamados.map((c) => c.bairro))].sort(), [chamados]);
  const resumo = useMemo(() => ({
    recebido: chamados.filter((c) => c.status === "recebido").length,
    caminho: chamados.filter((c) => c.status === "equipe_a_caminho").length,
    resolvido: chamados.filter((c) => c.status === "resolvido").length,
    urgentes: chamados.filter((c) => c.urgencia === "alta" && c.status !== "resolvido").length,
  }), [chamados]);

  const visiveis = useMemo(() => chamados
    .filter((c) => (filtro === "abertos" ? c.status !== "resolvido" : filtro === "resolvido" ? c.status === "resolvido" : true))
    .filter((c) => !bairro || c.bairro === bairro)
    .filter((c) => !soUrgentes || c.urgencia === "alta")
    .sort(ordenar), [chamados, filtro, bairro, soUrgentes]);

  const itensMapa = visiveis.filter((c) => c.latitude != null).map((c) => ({
    id: c.id, latitude: c.latitude, longitude: c.longitude, estado: estadoPin[c.status],
    urgente: c.urgencia === "alta" && c.status !== "resolvido",
    titulo: `#${c.protocolo} · ${TIPOS[c.tipo_problema]}`,
  }));

  const sel = chamados.find((c) => c.id === selId);

  async function atualizar(id, dados) {
    setSalvando(true);
    try {
      const novo = await api.atualizar(id, dados);
      setChamados((l) => l.map((c) => (c.id === id ? novo : c)));
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="painel">
      <header className="barra">
        <Logo />
        <span className="barra-tit">Painel da prefeitura</span>
        <span className="espaco" />
        <span className="pequeno claro-t">{usuario.nome}</span>
        <button className="btn sm claro" onClick={sair}>Sair</button>
      </header>

      <section className="resumo" aria-label="Resumo dos chamados">
        <div><b>{resumo.recebido}</b><span>Aguardando equipe</span></div>
        <div><b className="manut">{resumo.caminho}</b><span>Equipe a caminho</span></div>
        <div><b className="ok">{resumo.resolvido}</b><span>Resolvidos</span></div>
        <div className={resumo.urgentes ? "alerta" : ""}><b className="bad">{resumo.urgentes}</b><span>Urgentes em aberto</span></div>
      </section>

      <section className="filtros">
        <div className="abas" role="group" aria-label="Filtrar por situação">
          {FILTROS.map(([k, t]) => <button key={k} className="aba" aria-pressed={filtro === k} onClick={() => setFiltro(k)}>{t}</button>)}
        </div>
        <select className="input sel" value={bairro} onChange={(e) => setBairro(e.target.value)} aria-label="Filtrar por bairro">
          <option value="">Todos os bairros</option>
          {bairros.map((b) => <option key={b}>{b}</option>)}
        </select>
        <label className="check"><input type="checkbox" checked={soUrgentes} onChange={(e) => setSoUrgentes(e.target.checked)} /> Só urgentes</label>
        <span className="espaco" />
        <span className="legenda">
          <span><i className="bolinha" style={{ background: "var(--bad)" }} />Aguardando</span>
          <span><i className="bolinha" style={{ background: "var(--manut)" }} />Equipe a caminho</span>
          <span><i className="bolinha" style={{ background: "var(--ok)" }} />Resolvido</span>
        </span>
      </section>

      {erro && <div className="erro faixa" role="alert">{erro}</div>}
      {aviso && <div className="toast" role="status">{aviso}</div>}

      <main className="conteudo">
        <div className="mapa-area"><Mapa itens={itensMapa} selecionado={selId} onSelect={setSelId} /></div>
        <aside className="lateral">
          {sel ? (
            <Detalhe c={sel} onFechar={() => setSelId(null)} onAtualizar={atualizar} salvando={salvando} />
          ) : (
            <>
              <p className="pequeno cont">{visiveis.length} {visiveis.length === 1 ? "chamado" : "chamados"}</p>
              {!carregou && <p className="sub" style={{ padding: 20 }}>Carregando…</p>}
              {carregou && visiveis.length === 0 && <p className="sub" style={{ padding: 20 }}>Nenhum chamado com esses filtros.</p>}
              <div className="lista">{visiveis.map((c) => <Item key={c.id} c={c} ativo={false} onClick={() => setSelId(c.id)} />)}</div>
            </>
          )}
        </aside>
      </main>
    </div>
  );
}
