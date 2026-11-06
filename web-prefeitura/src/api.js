export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const TOKEN_KEY = "ilumina_token_prefeitura";
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

async function request(path, { method = "GET", json, form } = {}) {
  const headers = {};
  let body;
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (json !== undefined) { headers["Content-Type"] = "application/json"; body = JSON.stringify(json); }
  if (form) { headers["Content-Type"] = "application/x-www-form-urlencoded"; body = new URLSearchParams(form); }
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, { method, headers, body });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Confira se o backend está rodando.");
  }
  if (res.status === 401 && token) {
    setToken(null);
    window.dispatchEvent(new Event("ilumina:logout"));
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    let msg = "Algo deu errado. Tente novamente.";
    if (typeof data?.detail === "string") msg = data.detail;
    else if (Array.isArray(data?.detail)) msg = data.detail.map((d) => d.msg).join(". ");
    throw new Error(msg);
  }
  return data;
}

export const api = {
  login: (username, password) => request("/auth/login", { method: "POST", form: { username, password } }),
  me: () => request("/auth/me"),
  chamados: () => request("/painel/chamados"),
  atualizar: (id, dados) => request(`/painel/chamados/${id}`, { method: "PATCH", json: dados }),
};
