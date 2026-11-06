import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, getToken, setToken } from "./api";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(!!getToken());

  const carregar = useCallback(async () => {
    try {
      const u = await api.me();
      if (u.perfil !== "equipe_tecnica") throw new Error();
      setUsuario(u);
    } catch {
      setToken(null);
      setUsuario(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (getToken()) carregar();
    const sair = () => setUsuario(null);
    window.addEventListener("ilumina:logout", sair);
    return () => window.removeEventListener("ilumina:logout", sair);
  }, [carregar]);

  async function entrar(login, senha) {
    const r = await api.login(login, senha);
    if (r.perfil !== "equipe_tecnica") throw new Error("Acesso restrito à equipe técnica. Cidadãos usam o aplicativo IluminaAê.");
    setToken(r.access_token);
    await carregar();
  }

  function sair() { setToken(null); setUsuario(null); }

  return <Ctx.Provider value={{ usuario, carregando, entrar, sair }}>{children}</Ctx.Provider>;
}
