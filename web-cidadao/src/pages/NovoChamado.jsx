import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { IcAviso, IcBusca, IcCamera, IcCheck, IcLixo, IcPin } from "../components/Icons";
import { Topo } from "../components/Layout";
import Mapa from "../components/Mapa";
import { TIPOS } from "../util";

const NOMES_ETAPAS = ["Local", "Problema", "Foto", "Revisão"];

function Etapas({ atual }) {
  return (
    <div className="etapas" aria-label={`Etapa ${atual} de 4`}>
      {NOMES_ETAPAS.map((n, i) => (
        <div key={n} className={i + 1 < atual ? "feito" : i + 1 === atual ? "feito atual" : ""}>{i + 1}. {n}</div>
      ))}
    </div>
  );
}

export default function NovoChamado() {
  const nav = useNavigate();
  const [etapa, setEtapa] = useState(1);
  const [postes, setPostes] = useState([]);
  const [busca, setBusca] = useState("");
  const [poste, setPoste] = useState(null);
  const [manual, setManual] = useState(false);
  const [end, setEnd] = useState({ rua: "", bairro: "", numero_proximo: "" });
  const [tipo, setTipo] = useState("lampada_apagada");
  const [temLampada, setTemLampada] = useState(true);
  const [semEnergia, setSemEnergia] = useState(false);
  const [fotos, setFotos] = useState([]);
  const [obs, setObs] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [protocolo, setProtocolo] = useState(null);
  const inputFoto = useRef(null);

  useEffect(() => { api.postes().then(setPostes).catch((e) => setErro(e.message)); }, []);

  const previews = useMemo(() => fotos.map((f) => URL.createObjectURL(f)), [fotos]);
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  const sugestoes = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return [];
    return postes.filter((p) => p.codigo.toLowerCase().includes(q) || p.rua.toLowerCase().includes(q) || p.bairro.toLowerCase().includes(q)).slice(0, 5);
  }, [busca, postes]);

  const local = poste ? { rua: poste.rua, bairro: poste.bairro, linha2: `Poste ${poste.codigo} · Recife, PE` }
    : { rua: end.rua, bairro: end.bairro, linha2: end.numero_proximo ? `Próximo ao nº ${end.numero_proximo} · Recife, PE` : "Recife, PE" };
  const localOk = poste || (manual && end.rua.trim() && end.bairro.trim());

  function escolher(p) { setPoste(p); setManual(false); setBusca(""); setErro(""); }

  function addFotos(e) {
    const novas = [...e.target.files];
    e.target.value = "";
    const ok = novas.filter((f) => ["image/jpeg", "image/png", "image/webp"].includes(f.type));
    if (ok.length < novas.length) setErro("Use fotos nos formatos JPG, PNG ou WEBP.");
    else setErro("");
    setFotos((atual) => [...atual, ...ok].slice(0, 2));
  }

  function voltar() { setErro(""); etapa === 1 ? nav("/") : setEtapa(etapa - 1); }

  async function enviar() {
    setEnviando(true);
    setErro("");
    try {
      const fd = new FormData();
      fd.append("rua", local.rua);
      fd.append("bairro", local.bairro);
      if (poste) fd.append("codigo_poste", poste.codigo);
      if (!poste && end.numero_proximo) fd.append("numero_proximo", end.numero_proximo);
      fd.append("tipo_problema", tipo);
      fd.append("tem_lampada", String(temLampada));
      fd.append("sem_energia", String(semEnergia));
      if (obs.trim()) fd.append("descricao", obs.trim());
      fotos.forEach((f) => fd.append("fotos", f));
      const c = await api.criarChamado(fd);
      setProtocolo(c.protocolo);
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  if (protocolo) {
    return (
      <div className="shell">
        <div className="page sem-nav sucesso-tela">
          <div className="lampada-ok" aria-hidden="true">💡</div>
          <h1 className="titulo">Chamado enviado</h1>
          <p className="sub">A equipe técnica já foi avisada. Guarde o número do protocolo:</p>
          <p className="protocolo">#{protocolo}</p>
          <div style={{ display: "grid", gap: 10, width: "100%", marginTop: 12 }}>
            <button className="btn amber" onClick={() => nav("/chamados")}>Acompanhar meus chamados</button>
            <button className="btn claro" onClick={() => nav("/")}>Voltar ao início</button>
          </div>
        </div>
      </div>
    );
  }

  const podeAvancar = etapa === 1 ? !!localOk : true;

  return (
    <div className="shell">
      <header className="topo">
        <button className="icone-btn" aria-label="Voltar" onClick={voltar}>‹</button>
        <h1>Novo chamado</h1>
        <span style={{ minWidth: 40 }} />
      </header>
      <Etapas atual={etapa} />
      <div className="page sem-nav" style={{ paddingTop: 18 }}>
        {etapa === 1 && (
          <>
            <p className="etapa">Etapa 1 de 4</p>
            <h2 className="titulo">Onde está o poste?</h2>
            <p className="sub">Busque pelo código do poste ou toque nele no mapa.</p>
            <div className="campo" style={{ position: "relative" }}>
              <div className="linha" style={{ position: "relative" }}>
                <IcBusca width="20" height="20" style={{ position: "absolute", left: 14, color: "var(--muted)" }} />
                <input className="input" style={{ paddingLeft: 44 }} placeholder="Código do poste ou nome da rua" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar poste" />
              </div>
              {sugestoes.length > 0 && (
                <div className="sugestoes">
                  {sugestoes.map((p) => (
                    <button key={p.codigo} onClick={() => escolher(p)}>
                      <b>{p.codigo}</b> · {p.rua}<small>{p.bairro}, Recife</small>
                    </button>
                  ))}
                </div>
              )}
              {busca.trim() && sugestoes.length === 0 && <p className="pequeno">Nenhum poste encontrado para “{busca}”.</p>}
            </div>
            <Mapa postes={postes} selecionado={poste?.codigo} onSelect={escolher} altura={280} />
            {poste && (
              <div className="card linha">
                <div className="icone-caixa"><IcPin /></div>
                <div><b>{poste.rua} · {poste.bairro}</b><p className="pequeno">Poste {poste.codigo} · Recife, PE</p></div>
              </div>
            )}
            {!manual ? (
              <button className="btn link" style={{ alignSelf: "flex-start" }} onClick={() => { setManual(true); setPoste(null); }}>Não achei o poste, informar o endereço</button>
            ) : (
              <div className="card" style={{ display: "grid", gap: 12 }}>
                <div className="campo"><label htmlFor="rua">Rua</label><input id="rua" className="input" value={end.rua} onChange={(e) => setEnd({ ...end, rua: e.target.value })} /></div>
                <div className="grid2">
                  <div className="campo"><label htmlFor="bairro">Bairro</label><input id="bairro" className="input" value={end.bairro} onChange={(e) => setEnd({ ...end, bairro: e.target.value })} /></div>
                  <div className="campo"><label htmlFor="num">Nº próximo</label><input id="num" className="input" inputMode="numeric" value={end.numero_proximo} onChange={(e) => setEnd({ ...end, numero_proximo: e.target.value })} /></div>
                </div>
              </div>
            )}
          </>
        )}

        {etapa === 2 && (
          <>
            <p className="etapa">Etapa 2 de 4</p>
            <h2 className="titulo">Qual é o problema?</h2>
            <p className="sub">Escolha a opção que melhor descreve o que você encontrou.</p>
            <div className="card linha">
              <div className="icone-caixa"><IcPin /></div>
              <div><b>{local.rua} · {local.bairro}</b><p className="pequeno">{local.linha2}</p></div>
            </div>
            <div role="radiogroup" aria-label="Tipo de problema" style={{ display: "grid", gap: 10 }}>
              {Object.entries(TIPOS).map(([k, t]) => (
                <button key={k} role="radio" aria-checked={tipo === k} className="opcao" onClick={() => setTipo(k)}>
                  <span className="icone-caixa"><IcAviso /></span>
                  <span className="espaco"><b>{t.titulo}</b><small>{t.desc}</small></span>
                  <span className="radio">{tipo === k && <IcCheck />}</span>
                </button>
              ))}
            </div>
            <div className="campo">
              <span className="rotulo">O poste tem lâmpada?</span>
              <div className="seg">
                <button aria-pressed={temLampada} onClick={() => setTemLampada(true)}>Sim</button>
                <button aria-pressed={!temLampada} onClick={() => setTemLampada(false)}>Não</button>
              </div>
            </div>
            <div className="campo">
              <span className="rotulo">A rua está sem energia?</span>
              <div className="seg">
                <button aria-pressed={semEnergia} onClick={() => setSemEnergia(true)}>Sim</button>
                <button aria-pressed={!semEnergia} onClick={() => setSemEnergia(false)}>Não</button>
              </div>
            </div>
          </>
        )}

        {etapa === 3 && (
          <>
            <p className="etapa">Etapa 3 de 4 · opcional</p>
            <h2 className="titulo">Mostre o que aconteceu</h2>
            <p className="sub">Uma foto ajuda a equipe a identificar o problema e preparar o reparo. Até 2 fotos.</p>
            <input ref={inputFoto} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={addFotos} />
            <div className="fotos">
              {previews.map((src, i) => (
                <div className="foto" key={src}>
                  <img src={src} alt={`Foto ${i + 1} do poste`} />
                  <button aria-label={`Remover foto ${i + 1}`} onClick={() => setFotos(fotos.filter((_, j) => j !== i))}><IcLixo /></button>
                </div>
              ))}
              {fotos.length < 2 && (
                <button className="add-foto" onClick={() => inputFoto.current.click()}><IcCamera />Adicionar foto</button>
              )}
            </div>
          </>
        )}

        {etapa === 4 && (
          <>
            <p className="etapa">Etapa 4 de 4</p>
            <h2 className="titulo">Tudo certo para enviar?</h2>
            <p className="sub">Confira os dados e acrescente algum detalhe que possa ajudar a equipe.</p>
            <div className="linha"><b className="espaco">Resumo do chamado</b><button className="btn link" onClick={() => setEtapa(1)}>Editar dados</button></div>
            <div className="card linha">
              <div className="icone-caixa"><IcPin /></div>
              <div><b>{local.rua} · {local.bairro}</b><p className="pequeno">{local.linha2}</p></div>
            </div>
            <div className="card">
              <b>{TIPOS[tipo].titulo}</b>
              <p className="pequeno">{temLampada ? "Poste com lâmpada" : "Poste sem lâmpada"} · {semEnergia ? "rua sem energia" : "rua com energia"} · {fotos.length} {fotos.length === 1 ? "foto" : "fotos"}</p>
            </div>
            <div className="campo">
              <div className="linha"><label htmlFor="obs" className="espaco">Observações</label><span className="pequeno">Opcional</span></div>
              <textarea id="obs" className="input" placeholder="Ex.: o poste está apagado há três noites, em frente ao ponto de ônibus." value={obs} onChange={(e) => setObs(e.target.value)} maxLength={500} />
            </div>
          </>
        )}

        {erro && <div className="erro" role="alert">{erro}</div>}
        <div style={{ marginTop: "auto", paddingTop: 8 }}>
          {etapa < 4 ? (
            <button className="btn" disabled={!podeAvancar} onClick={() => { setErro(""); setEtapa(etapa + 1); }}>
              {etapa === 3 && fotos.length === 0 ? "Pular esta etapa" : "Continuar"}
            </button>
          ) : (
            <button className="btn amber" disabled={enviando} onClick={enviar}>{enviando ? "Enviando…" : "Enviar chamado"}</button>
          )}
        </div>
      </div>
    </div>
  );
}
