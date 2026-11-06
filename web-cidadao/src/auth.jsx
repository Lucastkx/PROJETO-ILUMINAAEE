import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, getToken, setToken } from "./api";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(!!getToken());

  const carregar = useCallback(async () => {
    try {
      setUsuario(await api.me());
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
    if (r.perfil !== "cidadao") {
      throw new Error("Esta conta é da equipe técnica. Use o painel da prefeitura.");
    }
    setToken(r.access_token);
    await carregar();
  }

  function sair() {
    setToken(null);
    setUsuario(null);
  }

  return (
    <Ctx.Provider value={{ usuario, carregando, entrar, sair, recarregar: carregar }}>
      {children}
    </Ctx.Provider>
  );
}
