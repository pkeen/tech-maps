import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import { divIcon, latLngBounds } from "leaflet";
import type { PointRecord } from "../../domains/locations/model";

type Props = {
  records: PointRecord[];
  selectedId: string | null;
  location: { latitude: number; longitude: number } | null;
  onSelect: (id: string) => void;
};

const tileUrl =
  import.meta.env.VITE_STREET_TILE_URL ||
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const tileAttribution =
  import.meta.env.VITE_STREET_TILE_ATTRIBUTION ||
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const defaultCenter: [number, number] = [51.34, 0.49];

function MapView({
  records,
  selectedId,
}: Pick<Props, "records" | "selectedId">) {
  const map = useMap();
  useEffect(() => {
    const selected = records.find(({ point }) => point.id === selectedId);
    if (selected) {
      map.flyTo(
        [selected.point.latitude, selected.point.longitude],
        Math.max(map.getZoom(), 14),
        { duration: 0.35 },
      );
    } else if (records.length > 0) {
      const bounds = latLngBounds(
        records.map(
          ({ point }) => [point.latitude, point.longitude] as [number, number],
        ),
      );
      map.fitBounds(bounds.pad(0.2), { maxZoom: 13, animate: false });
    }
  }, [map, records, selectedId]);
  return null;
}

export default function MapPanel({
  records,
  selectedId,
  location,
  onSelect,
}: Props) {
  return (
    <MapContainer
      className="map-canvas"
      center={defaultCenter}
      zoom={12}
      zoomControl={true}
      scrollWheelZoom={true}
      touchZoom={true}
    >
      <TileLayer url={tileUrl} attribution={tileAttribution} maxZoom={19} />
      <MapView records={records} selectedId={selectedId} />
      {records.map(({ point }) => {
        const selected = point.id === selectedId;
        const icon = divIcon({
          className: "point-marker-wrap",
          html: `<span class="point-marker${selected ? " point-marker-selected" : ""}" aria-hidden="true"></span>`,
          iconSize: [30, 36],
          iconAnchor: [15, 34],
        });
        return (
          <Marker
            key={point.id}
            position={[point.latitude, point.longitude]}
            icon={icon}
            eventHandlers={{ click: () => onSelect(point.id) }}
          >
            <Tooltip direction="top" offset={[0, -27]}>
              {point.name} · {point.code}
            </Tooltip>
          </Marker>
        );
      })}
      {location && (
        <CircleMarker
          center={[location.latitude, location.longitude]}
          radius={8}
          pathOptions={{
            color: "#fff",
            weight: 3,
            fillColor: "#3378d5",
            fillOpacity: 1,
          }}
        >
          <Tooltip>Your location</Tooltip>
        </CircleMarker>
      )}
    </MapContainer>
  );
}
