import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { IcSeta } from "../components/Icons";
import { Nav } from "../components/Layout";
import { maskCpf } from "../util";

function Voltar({ onClick }) {
  return <button className="btn link" style={{ alignSelf: "flex-start", padding: 0 }} onClick={onClick}>‹ Voltar às configurações</button>;
}

function Msg({ erro, ok }) {
  return (<>{erro && <div className="erro" role="alert">{erro}</div>}{ok && <div className="sucesso" role="status">{ok}</div>}</>);
}

function Dados({ voltar }) {
  const { usuario, recarregar } = useAuth();
  const [f, setF] = useState({ nome: usuario.nome || "", nome_social: usuario.nome_social || "", email: usuario.email || "", celular: usuario.celular || "", sexo: usuario.sexo || "", data_nascimento: usuario.data_nascimento || "" });
  const [erro, setErro] = useState(""); const [ok, setOk] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function salvar(e) {
    e.preventDefault(); setErro(""); setOk("");
    try { await api.atualizarDados({ ...f, sexo: f.sexo || null }); await recarregar(); setOk("Dados salvos."); } catch (err) { setErro(err.message); }
  }
  return (
    <form className="page" onSubmit={salvar}>
      <Voltar onClick={voltar} />
      <h1 className="titulo">Dados pessoais</h1>
      <div className="campo"><label htmlFor="n">Nome completo</label><input id="n" className="input" value={f.nome} onChange={set("nome")} required /></div>
      <div className="campo"><label htmlFor="ns">Nome social</label><input id="ns" className="input" value={f.nome_social} onChange={set("nome_social")} /></div>
      <div className="campo"><label htmlFor="c">CPF</label><input id="c" className="input" value={maskCpf(usuario.cpf || "")} disabled /></div>
      <div className="campo"><label htmlFor="e">E-mail</label><input id="e" type="email" className="input" value={f.email} onChange={set("email")} required /></div>
      <div className="grid2">
        <div className="campo"><label htmlFor="ce">Celular</label><input id="ce" className="input" value={f.celular} onChange={set("celular")} /></div>
        <div className="campo"><label htmlFor="d">Nascimento</label><input id="d" type="date" className="input" value={f.data_nascimento} onChange={set("data_nascimento")} /></div>
      </div>
      <div className="seg">
        <button type="button" aria-pressed={f.sexo === "FEM"} onClick={() => setF({ ...f, sexo: "FEM" })}>Feminino</button>
        <button type="button" aria-pressed={f.sexo === "MAS"} onClick={() => setF({ ...f, sexo: "MAS" })}>Masculino</button>
      </div>
      <Msg erro={erro} ok={ok} />
      <button className="btn amber">Salvar alterações</button>
    </form>
  );
}

function Endereco({ voltar }) {
  const { usuario, recarregar } = useAuth();
  const [f, setF] = useState({ cep: usuario.cep || "", rua: usuario.rua || "", numero: usuario.numero || "", bairro: usuario.bairro || "", cidade: usuario.cidade || "", estado: usuario.estado || "" });
  const [erro, setErro] = useState(""); const [ok, setOk] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function buscarCep() {
    const cep = f.cep.replace(/\D/g, "");
    if (cep.length !== 8) return;
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`).then((x) => x.json());
      if (!r.erro) setF((a) => ({ ...a, rua: r.logradouro || a.rua, bairro: r.bairro || a.bairro, cidade: r.localidade || a.cidade, estado: r.uf || a.estado }));
    } catch { /* o preenchimento automático é opcional */ }
  }
  async function salvar(e) {
    e.preventDefault(); setErro(""); setOk("");
    try { await api.atualizarEndereco(f); await recarregar(); setOk("Endereço salvo."); } catch (err) { setErro(err.message); }
  }
  return (
    <form className="page" onSubmit={salvar}>
      <Voltar onClick={voltar} />
      <h1 className="titulo">Endereço</h1>
      <div className="campo"><label htmlFor="cep">CEP</label><input id="cep" className="input" inputMode="numeric" value={f.cep} onChange={set("cep")} onBlur={buscarCep} /></div>
      <div className="campo"><label htmlFor="r">Rua</label><input id="r" className="input" value={f.rua} onChange={set("rua")} /></div>
      <div className="grid2">
        <div className="campo"><label htmlFor="nu">Número</label><input id="nu" className="input" value={f.numero} onChange={set("numero")} /></div>
        <div className="campo"><label htmlFor="b">Bairro</label><input id="b" className="input" value={f.bairro} onChange={set("bairro")} /></div>
      </div>
      <div className="grid2">
        <div className="campo"><label htmlFor="ci">Cidade</label><input id="ci" className="input" value={f.cidade} onChange={set("cidade")} /></div>
        <div className="campo"><label htmlFor="es">Estado</label><input id="es" className="input" maxLength={2} value={f.estado} onChange={(e) => setF({ ...f, estado: e.target.value.toUpperCase() })} /></div>
      </div>
      <Msg erro={erro} ok={ok} />
      <button className="btn amber">Salvar endereço</button>
    </form>
  );
}

function Senha({ voltar }) {
  const [f, setF] = useState({ senha: "", confirmar_senha: "" });
  const [erro, setErro] = useState(""); const [ok, setOk] = useState("");
  async function salvar(e) {
    e.preventDefault(); setErro(""); setOk("");
    try { await api.alterarSenha(f); setOk("Senha alterada."); setF({ senha: "", confirmar_senha: "" }); } catch (err) { setErro(err.message); }
  }
  return (
    <form className="page" onSubmit={salvar}>
      <Voltar onClick={voltar} />
      <h1 className="titulo">Alterar senha</h1>
      <div className="campo"><label htmlFor="s1">Nova senha</label><input id="s1" type="password" className="input" minLength={6} value={f.senha} onChange={(e) => setF({ ...f, senha: e.target.value })} required autoComplete="new-password" /></div>
      <div className="campo"><label htmlFor="s2">Confirmar nova senha</label><input id="s2" type="password" className="input" value={f.confirmar_senha} onChange={(e) => setF({ ...f, confirmar_senha: e.target.value })} required autoComplete="new-password" /></div>
      <Msg erro={erro} ok={ok} />
      <button className="btn amber">Salvar senha</button>
    </form>
  );
}

function Excluir({ voltar }) {
  const { sair } = useAuth();
  const nav = useNavigate();
  const [aceito, setAceito] = useState(false);
  const [erro, setErro] = useState("");
  async function excluir() {
    try { await api.excluirConta(); sair(); nav("/login"); } catch (err) { setErro(err.message); }
  }
  return (
    <div className="page">
      <Voltar onClick={voltar} />
      <h1 className="titulo">Excluir conta</h1>
      <p className="sub">Lamentamos sua saída. Seus dados pessoais (nome, CPF, e-mail, celular e endereço) serão apagados. Os chamados continuam no histórico da cidade, sem identificar você.</p>
      <label className="card linha" style={{ cursor: "pointer" }}>
        <input type="checkbox" checked={aceito} onChange={(e) => setAceito(e.target.checked)} style={{ width: 22, height: 22 }} />
        <span>Entendi e quero excluir minha conta.</span>
      </label>
      <Msg erro={erro} />
      <button className="btn perigo" disabled={!aceito} onClick={excluir}>Excluir minha conta</button>
      <button className="btn claro" onClick={voltar}>Cancelar</button>
    </div>
  );
}

export default function Perfil() {
  const { usuario, sair } = useAuth();
  const nav = useNavigate();
  const [aba, setAba] = useState("menu");
  const voltar = () => setAba("menu");
  const nome = usuario.nome_social || usuario.nome;
  const body = { dados: <Dados voltar={voltar} />, endereco: <Endereco voltar={voltar} />, senha: <Senha voltar={voltar} />, excluir: <Excluir voltar={voltar} /> }[aba];

  return (
    <div className="shell">
      {body ?? (
        <div className="page">
          <h1 className="titulo">Configurações</h1>
          <div className="card linha">
            <div className="icone-caixa" style={{ borderRadius: 999, fontWeight: 800, fontSize: 18 }}>{nome[0]}</div>
            <div><b>{usuario.nome}</b><p className="pequeno">{usuario.email}</p></div>
          </div>
          <div className="card menu-lista">
            {[["dados", "Dados pessoais"], ["endereco", "Endereço"], ["senha", "Alterar senha"], ["excluir", "Excluir conta"]].map(([k, t]) => (
              <button key={k} onClick={() => setAba(k)}><span className="espaco">{t}</span><IcSeta /></button>
            ))}
          </div>
          <button className="btn claro" onClick={() => { sair(); nav("/login"); }}>Sair</button>
        </div>
      )}
      <Nav />
    </div>
  );
}
