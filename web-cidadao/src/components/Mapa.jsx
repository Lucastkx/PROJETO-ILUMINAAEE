import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { IcAlvo } from "./Icons";

export const CENTRO = [-8.0595, -34.8805]; // Boa Vista, Recife

const icones = {};
function icone(estado, ativo) {
  const chave = ativo ? "ativo" : estado;
  if (!icones[chave]) {
    icones[chave] = L.divIcon({
      className: "",
      html: `<div class="pin pin-${estado} ${ativo ? "pin-ativo" : ""}"></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  }
  return icones[chave];
}

function Controles() {
  const map = useMap();
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      L.DomEvent.disableClickPropagation(ref.current);
      L.DomEvent.disableScrollPropagation(ref.current);
    }
  }, []);
  function localizar() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => map.flyTo([p.coords.latitude, p.coords.longitude], 17),
      () => alert("Não foi possível obter sua localização. Verifique a permissão do navegador.")
    );
  }
  return (
    <div className="mapa-ctrl" ref={ref}>
      <button type="button" aria-label="Aproximar" onClick={() => map.zoomIn()}>+</button>
      <button type="button" aria-label="Afastar" onClick={() => map.zoomOut()}>−</button>
      <button type="button" aria-label="Minha localização" onClick={localizar}><IcAlvo /></button>
    </div>
  );
}

function VoarPara({ alvo }) {
  const map = useMap();
  useEffect(() => {
    if (alvo) map.flyTo(alvo, Math.max(map.getZoom(), 17), { duration: 0.6 });
  }, [alvo, map]);
  return null;
}

/**
 * postes: [{codigo, latitude, longitude, rua}]
 * estados: { [codigo]: "ok" | "manutencao" | "problema" }
 */
export default function Mapa({ postes, estados = {}, selecionado, onSelect, altura = 300 }) {
  const sel = postes.find((p) => p.codigo === selecionado);
  return (
    <div className="mapa-wrap" style={{ height: altura }}>
      <MapContainer center={CENTRO} zoom={16} zoomControl={false} attributionControl={true} style={{ height: "100%" }}>
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {postes.map((p) => (
          <Marker
            key={p.codigo}
            position={[p.latitude, p.longitude]}
            icon={icone(estados[p.codigo] || "ok", p.codigo === selecionado)}
            title={`${p.codigo} · ${p.rua}`}
            eventHandlers={onSelect ? { click: () => onSelect(p) } : {}}
          />
        ))}
        <VoarPara alvo={sel ? [sel.latitude, sel.longitude] : null} />
        <Controles />
      </MapContainer>
    </div>
  );
}

export function Legenda() {
  return (
    <div className="legenda">
      <span><i className="bolinha" style={{ background: "var(--ok)" }} />Funcionando</span>
      <span><i className="bolinha" style={{ background: "var(--manut)" }} />Em manutenção</span>
      <span><i className="bolinha" style={{ background: "var(--bad)" }} />Problema reportado</span>
    </div>
  );
}
