import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import type { MetaFunction } from "react-router";
import { demoData } from "../domains/locations/demo-data";
import { buildPointRecords, searchPoints } from "../domains/locations/queries";

import PointDetails from "../features/point-finder/point-details";

const MapPanel = lazy(() => import("../features/map/map-panel"));
const allRecords = buildPointRecords(demoData);

export const meta: MetaFunction = () => [
  { title: "Tech Maps | Find a sampling point" },
  {
    name: "description",
    content: "Synthetic sampling-point map prototype for field testing.",
  },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [locating, setLocating] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const results = useMemo(() => searchPoints(allRecords, query), [query]);
  const selected =
    allRecords.find(({ point }) => point.id === selectedId) || null;

  // Leaflet accesses the DOM at import time, so load the map only in the browser.
  useEffect(() => setMapReady(true), []);

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
        <span className="demo-badge">DEMO DATA</span>
      </header>
      <div className="workspace">
        <aside className="finder-panel">
          <div className="finder-intro">
            <span className="eyebrow">FIELD POINT FINDER</span>
            <h1>Find your next point.</h1>
            <p>Search a catchment, route, site, point name or code.</p>
          </div>
          <div className="search-wrap">
            <label htmlFor="point-search">Search sampling points</label>
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
                placeholder="Try Medway A or DEM-002"
                autoComplete="off"
              />
            </div>
          </div>
          <div className="results-heading">
            <h2>Points</h2>
            <span>
              {results.length} {results.length === 1 ? "result" : "results"}
            </span>
          </div>
          <div className="result-list" aria-label="Sampling points">
            {results.length === 0 ? (
              <p className="empty-state">
                No points found. Try a route, site or point code.
              </p>
            ) : (
              results.map(({ point, site, routes }) => (
                <button
                  className={`result-card${selectedId === point.id ? " is-selected" : ""}`}
                  type="button"
                  key={point.id}
                  onClick={() => setSelectedId(point.id)}
                  aria-label={`Select ${point.name}, ${point.code}, ${site.name}`}
                >
                  <span className="result-icon" aria-hidden="true">
                    ⌖
                  </span>
                  <span className="result-text">
                    <strong>{point.name}</strong>
                    <span>
                      {site.name} · {routes[0]?.route.name || "Unassigned"}
                    </span>
                  </span>
                  <span className="result-code">{point.code}</span>
                </button>
              ))
            )}
          </div>
        </aside>
        <div className="map-column">
          <div className="map-header">
            <div>
              <span className="eyebrow">MAP VIEW</span>
              <strong>{query ? "Search results" : "All demo points"}</strong>
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
            <span>Map markers are also available in the points list.</span>
            <span>Demo locations only</span>
          </div>
          {selected && (
            <PointDetails
              key={selected.point.id}
              record={selected}
              onClose={() => setSelectedId(null)}
            />
          )}
        </div>
      </div>
    </main>
  );
}
