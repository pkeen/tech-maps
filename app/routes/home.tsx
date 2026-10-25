import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { MetaFunction } from "react-router";
import { demoData } from "../domains/locations/demo-data";
import { loadMedwayData } from "../domains/locations/medway-data";
import type { LocationData } from "../domains/locations/model";
import {
  buildPointRecords,
  recordsForRoute,
  searchPoints,
} from "../domains/locations/queries";
import PointDetails from "../features/point-finder/point-details";

const MapPanel = lazy(() => import("../features/map/map-panel"));
const LAST_ROUTE_KEY = "tech-maps:last-route:v1";

export const meta: MetaFunction = () => [
  { title: "Tech Maps | Medway routes" },
  { name: "description", content: "Route and point finder for field visits." },
];

function restoredRouteId(data: LocationData): string {
  try {
    const stored = window.localStorage.getItem(LAST_ROUTE_KEY);
    if (stored && data.routes.some((route) => route.id === stored))
      return stored;
  } catch {
    // Managed browsers may block storage; the first route remains usable.
  }
  return data.routes[0]?.id ?? "";
}

export default function Home() {
  const [data, setData] = useState<LocationData | null>(null);
  const [dataMode, setDataMode] = useState<
    "reviewed" | "public" | "demo" | null
  >(null);
  const [dataError, setDataError] = useState("");
  const [query, setQuery] = useState("");
  const [routeId, setRouteId] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [locating, setLocating] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMapReady(true); // Leaflet is loaded only after the browser starts.
    let cancelled = false;
    loadMedwayData()
      .then((reviewed) => {
        if (cancelled) return;
        const initial = reviewed ?? demoData;
        setData(initial);
        setDataMode(
          reviewed ? (import.meta.env.DEV ? "reviewed" : "public") : "demo",
        );
        setRouteId(restoredRouteId(initial));
      })
      .catch((error: unknown) => {
        if (!cancelled)
          setDataError(
            error instanceof Error
              ? error.message
              : "Local reviewed data could not be loaded",
          );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const records = useMemo(() => (data ? buildPointRecords(data) : []), [data]);
  const selectedRoute =
    data?.routes.find((route) => route.id === routeId) ?? null;
  const orderedRouteRecords = useMemo(
    () => (selectedRoute ? recordsForRoute(records, selectedRoute) : records),
    [records, selectedRoute],
  );
  const results = useMemo(
    () => searchPoints(orderedRouteRecords, query),
    [orderedRouteRecords, query],
  );
  const selected = records.find(({ point }) => point.id === selectedId) ?? null;
  const orderById = new Map(
    selectedRoute?.pointIds.map((id, index) => [id, index + 1]) ?? [],
  );

  useEffect(() => {
    if (selectedId && window.innerWidth <= 800)
      detailsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }, [selectedId]);

  function chooseRoute(id: string) {
    setRouteId(id);
    setSelectedId(null);
    setQuery("");
    if (id) {
      try {
        window.localStorage.setItem(LAST_ROUTE_KEY, id);
      } catch {
        /* Storage is optional. */
      }
    }
  }

  function closeDetails() {
    setSelectedId(null);
    if (window.innerWidth <= 800)
      listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocationMessage(
        "Location is unavailable in this browser. Search and map remain available.",
      );
      return;
    }
    setLocating(true);
    setLocationMessage("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation({ latitude: coords.latitude, longitude: coords.longitude });
        setLocationMessage("Your location is shown on the map.");
        setLocating(false);
      },
      () => {
        setLocationMessage(
          "Location could not be shown. Search and map remain available.",
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            ⌖
          </span>
          <span>Tech Maps</span>
        </div>
      </header>
      {dataError ? (
        <section className="load-error" role="alert">
          <h1>Local data unavailable</h1>
          <p>{dataError}</p>
          <p>Check the ignored review JSON, then reload this local page.</p>
        </section>
      ) : !data ? (
        <p className="loading-state" role="status">
          Loading routes…
        </p>
      ) : (
        <div className="workspace">
          <aside className="finder-panel">
            <div className="finder-intro">
              <span className="eyebrow">FIELD POINT FINDER</span>
              <h1>
                {dataMode !== "demo"
                  ? "Medway routes"
                  : "Find your next point."}
              </h1>
              <p>
                {dataMode !== "demo"
                  ? "Choose a route, then open a point in exported order."
                  : "Search a route, site, point name or code."}
              </p>
            </div>
            <div className="route-picker">
              <label htmlFor="route-select">Route</label>
              <select
                id="route-select"
                value={routeId}
                onChange={(event) => chooseRoute(event.target.value)}
              >
                <option value="">All points</option>
                {data.routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name} · {route.pointIds.length} stops
                  </option>
                ))}
              </select>
            </div>
            <div className="search-wrap">
              <label htmlFor="point-search">Search points</label>
              <div className="search-field">
                <span aria-hidden="true">⌕</span>
                <input
                  id="point-search"
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setSelectedId(null);
                  }}
                  placeholder={
                    dataMode !== "demo"
                      ? "Search a source label"
                      : "Try a point or site"
                  }
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="results-heading">
              <h2>
                {selectedRoute ? `${selectedRoute.name} stops` : "All points"}
              </h2>
              <span>
                {results.length}{" "}
                {selectedRoute
                  ? results.length === 1
                    ? "stop"
                    : "stops"
                  : results.length === 1
                    ? "point"
                    : "points"}
              </span>
            </div>
            <div
              className="result-list"
              ref={listRef}
              aria-label={
                selectedRoute
                  ? `${selectedRoute.name} stops in exported order`
                  : "All points"
              }
            >
              {results.length === 0 ? (
                <p className="empty-state">
                  No points found. Try another label or route.
                </p>
              ) : (
                results.map(({ point, site, routes }) => {
                  const sequence = orderById.get(point.id);
                  return (
                    <button
                      className={`result-card${selectedId === point.id ? " is-selected" : ""}`}
                      type="button"
                      key={point.id}
                      onClick={() => setSelectedId(point.id)}
                      aria-label={`${sequence ? `Stop ${sequence}, ` : ""}${point.name}${site ? `, ${site.name}` : ""}`}
                    >
                      <span className="result-icon" aria-hidden="true">
                        {sequence ?? "⌖"}
                      </span>
                      <span className="result-text">
                        <strong>{point.name}</strong>
                        <span>
                          {site ? `${site.name} · ` : ""}
                          {routes[0]?.name ?? "Unassigned"}
                        </span>
                      </span>
                      {point.code && (
                        <span className="result-code">{point.code}</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
            {dataMode !== "demo" && !selectedRoute && (
              <p className="global-order-note">
                All points follow source file order. Choose a route for its
                exported folder order.
              </p>
            )}
          </aside>
          <div className="map-column">
            {selected && (
              <div className="details-wrap" ref={detailsRef}>
                <PointDetails
                  key={selected.point.id}
                  record={selected}
                  reviewed={dataMode === "reviewed"}
                  onClose={closeDetails}
                />
              </div>
            )}
            <div className="map-header">
              <div>
                <span className="eyebrow">MAP VIEW</span>
                <strong>{selectedRoute?.name ?? "All points"}</strong>
              </div>
              <button
                className="location-button"
                type="button"
                onClick={useMyLocation}
                disabled={locating}
              >
                <span aria-hidden="true">◎</span>{" "}
                {locating ? "Locating…" : "Use my location"}
              </button>
            </div>
            {locationMessage && (
              <p className="location-message" role="status">
                {locationMessage}
              </p>
            )}
            <div className="map-frame" aria-label="Map of sampling points">
              {mapReady ? (
                <Suspense
                  fallback={<div className="map-loading">Loading map…</div>}
                >
                  <MapPanel
                    records={results}
                    selectedId={selectedId}
                    location={location}
                    onSelect={setSelectedId}
                  />
                </Suspense>
              ) : (
                <div className="map-loading">Loading map…</div>
              )}
            </div>
            <div className="map-footer">
              <span>Drag to pan; pinch or scroll to zoom.</span>
              <span>
                {dataMode === "reviewed"
                  ? "Local review data"
                  : dataMode === "public"
                    ? "Medway locations"
                    : "Demo locations only"}
              </span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
