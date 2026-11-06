import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    try { await entrar(login, senha); nav("/"); } catch (err) { setErro(err.message); } finally { setEnviando(false); }
  }

  return (
    <div className="login-tela">
      <div className="login-luz"><PosteComLuz /></div>
      <form className="login-cartao" onSubmit={enviar}>
        <div>
          <Logo tamanho="g" />
          <p className="sub" style={{ marginTop: 6 }}>Painel da equipe técnica de iluminação pública</p>
        </div>
        <div className="campo"><label htmlFor="l">CPF ou e-mail institucional</label><input id="l" className="input" value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="username" required /></div>
        <div className="campo"><label htmlFor="s">Senha</label><input id="s" type="password" className="input" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" required /></div>
        {erro && <div className="erro" role="alert">{erro}</div>}
        <button className="btn amber" disabled={enviando}>{enviando ? "Entrando…" : "Entrar no painel"}</button>
      </form>
    </div>
  );
}
