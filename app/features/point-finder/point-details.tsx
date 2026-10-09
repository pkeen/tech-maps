import { useState } from "react";
import type { PointRecord } from "../../domains/locations/model";
import { directionsUrl } from "../../domains/locations/queries";

export default function PointDetails({
  record,
  onClose,
  reviewed,
}: {
  record: PointRecord;
  onClose: () => void;
  reviewed: boolean;
}) {
  const { point, project, site, routes } = record;
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
      <button className="back-link" type="button" onClick={onClose}>
        ← Back to route list
      </button>
      <div className="details-heading">
        <div>
          {point.code ? <span className="eyebrow">{point.code}</span> : null}
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
          <dt>Project</dt>
          <dd>
            {project.name}
            {project.code ? (
              <span className="muted"> ({project.code})</span>
            ) : null}
          </dd>
        </div>
        <div>
          <dt>Site</dt>
          <dd>
            {site ? (
              <>
                {site.name}
                {site.code ? (
                  <span className="muted"> ({site.code})</span>
                ) : null}
              </>
            ) : (
              "Site not recorded"
            )}
          </dd>
        </div>
        <div>
          <dt>Route</dt>
          <dd>{routes.map(({ name }) => name).join("; ") || "Unassigned"}</dd>
        </div>
        <div className="coordinates-row">
          <dt>Exact coordinates</dt>
          <dd>{coordinates}</dd>
        </div>
      </dl>
      {point.description && (
        <div className="source-note">
          <strong>{reviewed ? "Source description" : "Description"}</strong>
          <p>{point.description}</p>
        </div>
      )}
      {reviewed && !point.description && (
        <p className="source-note-empty">No source description recorded.</p>
      )}
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
