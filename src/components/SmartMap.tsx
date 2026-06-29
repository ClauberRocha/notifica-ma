import { useMemo } from "react";
import { MapContainer, TileLayer, Circle, Popup } from "react-leaflet";
import { MUN_COORDS } from "@/data/municipio-coords";
import "leaflet/dist/leaflet.css";

type CaseRow = Record<string, unknown> & {
  _tipo: string;
  municipio_notificacao?: string | null;
  classificacao_caso?: string | null;
  classificacao_final?: string | null;
  status?: string | null;
};

interface SmartMapProps {
  filteredCases: CaseRow[];
  heatmapMode: boolean;
  metric: "notificados" | "confirmados";
}

function normalize(s: string): string {
  return (s || "").toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

export default function SmartMap({ filteredCases, heatmapMode, metric }: SmartMapProps) {
  const mapData = useMemo(() => {
    const groups: Record<
      string,
      {
        name: string;
        notificados: number;
        confirmados: number;
        investigacao: number;
        coords: [number, number];
      }
    > = {};

    filteredCases.forEach((c) => {
      const originalName = (c.municipio_notificacao as string) || "Desconhecido";
      const normName = normalize(originalName);
      
      const coords = MUN_COORDS[normName];
      if (!coords) return; // Ignore if no coordinates found

      const isConf =
        c.classificacao_caso === "confirmado" ||
        c.classificacao_final === "confirmado";
      const isInv = c.status === "em_investigacao";

      if (!groups[normName]) {
        groups[normName] = {
          name: originalName,
          notificados: 0,
          confirmados: 0,
          investigacao: 0,
          coords,
        };
      }

      groups[normName].notificados++;
      if (isConf) groups[normName].confirmados++;
      if (isInv) groups[normName].investigacao++;
    });

    return Object.values(groups);
  }, [filteredCases]);

  // Center of Maranhão
  const center: [number, number] = [-5.2, -45.2];

  return (
    <div className="w-full h-[520px] rounded-xl overflow-hidden border border-border shadow-sm relative">
      <MapContainer
        center={center}
        zoom={7}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%", zIndex: 5 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {mapData.map((mun) => {
          const value = metric === "confirmados" ? mun.confirmados : mun.notificados;
          if (value === 0) return null;

          // Adjust radius dynamically (meters)
          let radius: number;
          if (heatmapMode) {
            // Heatmap uses larger, softer blending circles
            radius = Math.max(16000, Math.min(85000, value * 2200));
          } else {
            // Bubble map uses smaller, defined sizing
            radius = Math.max(6000, Math.min(50000, value * 1200));
          }

          // Visual styles
          const color = heatmapMode
            ? "#ea580c" // Deep Orange heatmap glow
            : metric === "confirmados"
            ? "#dc2626" // Red for confirmed bubbles
            : "#2563eb"; // Blue for notified bubbles

          const fillOpacity = heatmapMode
            ? Math.max(0.08, Math.min(0.25, 0.06 + value * 0.008))
            : 0.55;

          return (
            <Circle
              key={mun.name}
              center={mun.coords}
              radius={radius}
              pathOptions={{
                color: heatmapMode ? "transparent" : color,
                fillColor: color,
                fillOpacity: fillOpacity,
                weight: heatmapMode ? 0 : 1.5,
              }}
            >
              <Popup>
                <div className="space-y-1.5 p-0.5 text-xs">
                  <h4 className="font-bold text-sm text-foreground border-b pb-1">
                    {mun.name}
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                    <span className="text-muted-foreground">Notificados:</span>
                    <span className="font-bold text-foreground text-right">{mun.notificados}</span>
                    
                    <span className="text-muted-foreground">Confirmados:</span>
                    <span className="font-bold text-destructive text-right">{mun.confirmados}</span>
                    
                    <span className="text-muted-foreground">Em investigação:</span>
                    <span className="font-bold text-yellow-600 text-right">{mun.investigacao}</span>
                  </div>
                </div>
              </Popup>
            </Circle>
          );
        })}
      </MapContainer>
    </div>
  );
}
