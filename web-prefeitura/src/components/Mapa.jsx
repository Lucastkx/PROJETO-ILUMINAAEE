import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

const CENTRO = [-8.0595, -34.8805];
const cache = {};
function icone(estado, ativo, urgente) {
  const k = `${estado}-${ativo}-${urgente}`;
  if (!cache[k]) {
    cache[k] = L.divIcon({
      className: "",
      html: `<div class="pin pin-${estado} ${ativo ? "pin-ativo" : ""} ${urgente ? "pin-urgente" : ""}"></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  }
  return cache[k];
}

function Ajustar({ itens, selecionado }) {
  const map = useMap();
  const jaAjustou = useRef(false);
  useEffect(() => {
    if (jaAjustou.current || itens.length === 0) return;
    jaAjustou.current = true;
    map.fitBounds(L.latLngBounds(itens.map((i) => [i.latitude, i.longitude])), { padding: [60, 60], maxZoom: 16 });
  }, [itens, map]);
  useEffect(() => {
    const s = itens.find((i) => i.id === selecionado);
    if (s) map.flyTo([s.latitude, s.longitude], Math.max(map.getZoom(), 16), { duration: 0.5 });
  }, [selecionado]); // eslint-disable-line
  return null;
}

/** itens: [{id, latitude, longitude, estado, urgente, titulo}] */
export default function Mapa({ itens, selecionado, onSelect }) {
  return (
    <MapContainer center={CENTRO} zoom={15} style={{ height: "100%", width: "100%" }}>
      <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
      {itens.map((i) => (
        <Marker
          key={i.id}
          position={[i.latitude, i.longitude]}
          icon={icone(i.estado, i.id === selecionado, i.urgente)}
          title={i.titulo}
          zIndexOffset={i.id === selecionado ? 1000 : i.urgente ? 500 : 0}
          eventHandlers={{ click: () => onSelect(i.id) }}
        />
      ))}
      <Ajustar itens={itens} selecionado={selecionado} />
    </MapContainer>
  );
}
