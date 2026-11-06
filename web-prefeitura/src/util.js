export const TIPOS = {
  lampada_apagada: "Lâmpada apagada",
  lampada_quebrada: "Lâmpada quebrada/danificada",
  luz_acesa_de_dia: "Luz acesa de dia",
  outro: "Outro problema",
};
export const STATUS = {
  recebido: "Recebido",
  equipe_a_caminho: "Equipe a caminho",
  resolvido: "Resolvido",
};
export const estadoPin = { recebido: "problema", equipe_a_caminho: "manutencao", resolvido: "ok" };

const dt = (iso) => new Date(iso + "Z");
export const fmtDataHora = (iso) => dt(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export function haQuanto(iso) {
  const min = Math.max(0, Math.round((Date.now() - dt(iso).getTime()) / 60000));
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  return `há ${d} ${d === 1 ? "dia" : "dias"}`;
}
