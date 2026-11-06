import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import Logo from "../components/Logo";

export default function EsqueciSenha() {
  const [v, setV] = useState("");
  const [ok, setOk] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(e) {
    e.preventDefault();
    setErro("");
    try {
      await api.esqueciSenha(v);
      setOk(true);
    } catch (err) {
      setErro(err.message);
    }
  }

  return (
    <div className="shell">
      <form className="page sem-nav" onSubmit={enviar}>
        <Logo />
        <h1 className="titulo">Redefina sua senha</h1>
        {ok ? (
          <div className="sucesso">Se o cadastro existir, enviaremos um link de redefinição para o e-mail cadastrado.</div>
        ) : (
          <>
            <p className="sub">Digite o CPF ou o e-mail cadastrado para enviarmos um link de redefinição.</p>
            <div className="campo"><label htmlFor="v">CPF ou e-mail</label><input id="v" className="input" value={v} onChange={(e) => setV(e.target.value)} required /></div>
            {erro && <div className="erro" role="alert">{erro}</div>}
            <button className="btn amber">Enviar link</button>
          </>
        )}
        <Link to="/login" className="centro">Voltar para o login</Link>
      </form>
    </div>
  );
}
