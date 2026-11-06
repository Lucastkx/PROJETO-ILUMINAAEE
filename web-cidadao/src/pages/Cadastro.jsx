import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import Logo from "../components/Logo";
import { maskCpf, soDigitos } from "../util";

export default function Cadastro() {
  const { entrar } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ nome: "", nome_social: "", cpf: "", email: "", celular: "", sexo: "", data_nascimento: "", senha: "", confirmar: "" });
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: k === "cpf" ? maskCpf(e.target.value) : e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setErro("");
    if (soDigitos(f.cpf).length !== 11) return setErro("Digite um CPF com 11 números.");
    if (f.senha !== f.confirmar) return setErro("As senhas não conferem.");
    setEnviando(true);
    try {
      const { confirmar, ...dados } = f;
      await api.cadastro({ ...dados, sexo: dados.sexo || null, nome_social: dados.nome_social || null, celular: dados.celular || null, data_nascimento: dados.data_nascimento || null });
      await entrar(f.email, f.senha);
      nav("/");
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="shell">
      <form className="page sem-nav" onSubmit={enviar}>
        <div><Logo /></div>
        <h1 className="titulo">Crie sua conta</h1>
        <p className="sub">Com a conta você acompanha cada chamado até o poste voltar a acender.</p>
        <div className="campo"><label htmlFor="nome">Nome completo</label><input id="nome" className="input" value={f.nome} onChange={set("nome")} required minLength={3} /></div>
        <div className="campo"><label htmlFor="social">Nome social (opcional)</label><input id="social" className="input" value={f.nome_social} onChange={set("nome_social")} /></div>
        <div className="campo"><label htmlFor="cpf">CPF</label><input id="cpf" className="input" inputMode="numeric" value={f.cpf} onChange={set("cpf")} placeholder="000.000.000-00" required /></div>
        <div className="campo"><label htmlFor="email">E-mail</label><input id="email" type="email" className="input" value={f.email} onChange={set("email")} required /></div>
        <div className="grid2">
          <div className="campo"><label htmlFor="cel">Celular</label><input id="cel" className="input" inputMode="tel" value={f.celular} onChange={set("celular")} /></div>
          <div className="campo"><label htmlFor="nasc">Nascimento</label><input id="nasc" type="date" className="input" value={f.data_nascimento} onChange={set("data_nascimento")} /></div>
        </div>
        <div className="campo">
          <span className="rotulo">Sexo</span>
          <div className="seg">
            <button type="button" aria-pressed={f.sexo === "FEM"} onClick={() => setF({ ...f, sexo: "FEM" })}>Feminino</button>
            <button type="button" aria-pressed={f.sexo === "MAS"} onClick={() => setF({ ...f, sexo: "MAS" })}>Masculino</button>
          </div>
        </div>
        <div className="grid2">
          <div className="campo"><label htmlFor="s1">Senha</label><input id="s1" type="password" className="input" value={f.senha} onChange={set("senha")} minLength={6} required autoComplete="new-password" /></div>
          <div className="campo"><label htmlFor="s2">Confirmar senha</label><input id="s2" type="password" className="input" value={f.confirmar} onChange={set("confirmar")} required autoComplete="new-password" /></div>
        </div>
        <p className="pequeno">Usamos seus dados só para identificar seus chamados. Você pode excluir a conta quando quiser.</p>
        {erro && <div className="erro" role="alert">{erro}</div>}
        <button className="btn amber" disabled={enviando}>{enviando ? "Criando…" : "Criar conta"}</button>
        <p className="centro pequeno">Já tem conta? <Link to="/login">Entrar</Link></p>
      </form>
    </div>
  );
}
