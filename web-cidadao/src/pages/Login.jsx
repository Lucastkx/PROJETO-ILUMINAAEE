import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import Logo, { PosteComLuz } from "../components/Logo";

export default function Login() {
  const { entrar } = useAuth();
  const nav = useNavigate();
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await entrar(login, senha);
      nav("/");
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="shell entrada">
      <div className="luz-topo"><PosteComLuz /></div>
      <form className="cartao-entrada" onSubmit={enviar}>
        <div className="centro">
          <Logo tamanho="g" />
          <p className="sub" style={{ marginTop: 6 }}>Poste apagado? Avise e acompanhe o conserto.</p>
        </div>
        <div className="campo">
          <label htmlFor="login">CPF ou e-mail</label>
          <input id="login" className="input" value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="username" required />
        </div>
        <div className="campo">
          <label htmlFor="senha">Senha</label>
          <input id="senha" type="password" className="input" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" required />
        </div>
        {erro && <div className="erro" role="alert">{erro}</div>}
        <button className="btn amber" disabled={enviando}>{enviando ? "Entrando…" : "Entrar"}</button>
        <div className="centro" style={{ display: "grid", gap: 10 }}>
          <Link to="/esqueci-senha">Esqueci minha senha</Link>
          <span className="pequeno">Ainda não tem conta? <Link to="/cadastro">Criar cadastro</Link></span>
        </div>
      </form>
    </div>
  );
}
