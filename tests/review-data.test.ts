import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  buildPointRecords,
  recordsForRoute,
  routeSegments,
  segmentDirectionsUrl,
  validateLocationData,
} from "../app/domains/locations/queries";
import { parseReviewedImport } from "../app/domains/locations/review-data";

const reviewPath = new URL("../raw/medway-import.review.json", import.meta.url);
const source = existsSync(reviewPath)
  ? JSON.parse(readFileSync(reviewPath, "utf8"))
  : null;

describe.skipIf(!source)("private Medway review import", () => {
  it("preserves every exported folder sequence and source description", () => {
    const data = parseReviewedImport(source);
    expect(data.routes.map((route) => route.pointIds.length)).toEqual([
      8, 10, 11,
    ]);
    expect(data.points).toHaveLength(29);
    expect(data.points.filter((point) => point.description)).toHaveLength(28);
    expect(validateLocationData(data)).toEqual([]);
    const records = buildPointRecords(data);

    for (const [index, route] of data.routes.entries()) {
      expect(route.pointIds).toEqual(source.routes[index].pointIds);
      expect(
        recordsForRoute(records, route).map(({ point }) => point.id),
      ).toEqual(source.routes[index].pointIds);
    }
    expect(data.points.map((point) => point.description)).toEqual(
      source.points.map((point: { description: string }) => point.description),
    );
    expect(data.sites).toEqual([]);
    expect(data.projects).toEqual([{ id: "medway", name: "Medway" }]);
    expect(data.routes.every((route) => route.projectId === "medway")).toBe(
      true,
    );
    expect(data.points.every((point) => point.siteId === null)).toBe(true);
  });

  it("rejects duplicate membership, missing references, and invalid coordinates", () => {
    const duplicate = structuredClone(source);
    duplicate.routes[1].pointIds[0] = duplicate.routes[0].pointIds[0];
    expect(() => parseReviewedImport(duplicate)).toThrow(
      /multiple review routes/,
    );

    const missing = structuredClone(source);
    missing.routes[0].pointIds[0] = "missing";
    expect(() => parseReviewedImport(missing)).toThrow(/missing point/);

    const invalid = structuredClone(source);
    invalid.points[0].latitude = 100;
    expect(() => parseReviewedImport(invalid)).toThrow(/invalid coordinates/);
  });

  it("offers labelled mobile-sized segments without dropping any stop", () => {
    const data = parseReviewedImport(source);
    const records = buildPointRecords(data);
    for (const route of data.routes) {
      const ordered = recordsForRoute(records, route);
      const segments = routeSegments(ordered);
      expect(segments.flat().map(({ point }) => point.id)).toEqual(
        route.pointIds,
      );
      expect(segments.every((segment) => segment.length <= 4)).toBe(true);
      for (const segment of segments.filter((group) => group.length > 1)) {
        const url = new URL(
          segmentDirectionsUrl(segment.map(({ point }) => point)),
        );
        expect(url.searchParams.get("origin")).toBeNull();
        expect(url.searchParams.get("destination")).toBe(
          `${segment.at(-1)?.point.latitude},${segment.at(-1)?.point.longitude}`,
        );
        expect(url.searchParams.get("waypoints")?.split("|")).toEqual(
          segment
            .slice(0, -1)
            .map(({ point }) => `${point.latitude},${point.longitude}`),
        );
      }
    }
  });
});
