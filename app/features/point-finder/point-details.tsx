import { useState } from "react";
import type { PointRecord } from "../../domains/locations/model";
import { directionsUrl } from "../../domains/locations/queries";

export default function PointDetails({
  record,
  onClose,
}: {
  record: PointRecord;
  onClose: () => void;
}) {
  const { point, site, routes } = record;
  const coordinates = `${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}`;
  const [copied, setCopied] = useState(false);

  async function copyCoordinates() {
    try {
      await navigator.clipboard.writeText(coordinates);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="details-card" aria-label="Selected point details">
      <div className="details-heading">
        <div>
          <span className="eyebrow">Selected point · {point.code}</span>
          <h2>{point.name}</h2>
        </div>
        <button
          className="icon-button"
          type="button"
          onClick={onClose}
          aria-label="Close point details"
        >
          ×
        </button>
      </div>
      <dl className="details-grid">
        <div>
          <dt>Site</dt>
          <dd>
            {site.name} <span className="muted">({site.code})</span>
          </dd>
        </div>
        <div>
          <dt>Route / job</dt>
          <dd>
            {routes
              .map(({ route, job }) => `${route.name} · ${job.name}`)
              .join("; ") || "Unassigned"}
          </dd>
        </div>
        <div className="coordinates-row">
          <dt>Exact coordinates</dt>
          <dd>{coordinates}</dd>
        </div>
      </dl>
      <p className="approach-note">
        Driving directions may end at the nearest reachable road. Use these
        exact coordinates for the final approach.
      </p>
      <div className="detail-actions">
        <a
          className="primary-button"
          href={directionsUrl(point)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open in Google Maps <span aria-hidden="true">↗</span>
        </a>
        <button
          className="secondary-button"
          type="button"
          onClick={copyCoordinates}
        >
          {copied ? "Copied" : "Copy coordinates"}
        </button>
      </div>
    </section>
  );
}
