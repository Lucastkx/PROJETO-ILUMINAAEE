export const TIPOS = {
  lampada_apagada: { titulo: "Lâmpada apagada", desc: "O poste não ilumina à noite." },
  lampada_quebrada: { titulo: "Lâmpada quebrada/danificada", desc: "Vidro ou luminária com danos." },
  luz_acesa_de_dia: { titulo: "Luz acesa de dia", desc: "O poste fica aceso durante o dia." },
  outro: { titulo: "Outro problema", desc: "Algo diferente, conte nas observações." },
};

export const STATUS = {
  recebido: { rotulo: "Recebido", ordem: 0 },
  equipe_a_caminho: { rotulo: "Equipe a caminho", ordem: 1 },
  resolvido: { rotulo: "Resolvido", ordem: 2 },
};

export const fmtData = (iso) =>
  new Date(iso + "Z").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).replace(/\./g, "");

export const fmtDataHora = (iso) =>
  new Date(iso + "Z").toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export const soDigitos = (v) => (v || "").replace(/\D/g, "");

export function maskCpf(v) {
  const d = soDigitos(v).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
