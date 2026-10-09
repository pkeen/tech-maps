import { describe, expect, it } from "vitest";
import { demoData } from "../app/domains/locations/demo-data";
import {
  buildPointRecords,
  directionsUrl,
  searchPoints,
  validateLocationData,
} from "../app/domains/locations/queries";

const records = buildPointRecords(demoData);

describe("synthetic location data", () => {
  it("has valid references and coordinates", () => {
    expect(validateLocationData(demoData)).toEqual([]);
    expect(records).toHaveLength(demoData.points.length);
  });

  it("rejects missing references and invalid coordinates", () => {
    const invalid = structuredClone(demoData);
    invalid.points[0].siteId = "missing";
    invalid.points[1].latitude = 100;
    invalid.routes[0].pointIds.push("missing");
    expect(validateLocationData(invalid)).toEqual(
      expect.arrayContaining([
        "p-01: missing site",
        "p-02: invalid coordinates",
        "r-medway-a: missing point missing",
      ]),
    );
  });
});

describe("point search", () => {
  it("finds points through project and route names, ignoring case", () => {
    expect(searchPoints(records, "mEdWaY")).toHaveLength(13);
    expect(
      searchPoints(records, "MEDWAY A").map(({ point }) => point.code),
    ).toEqual([
      "DEM-001",
      "DEM-002",
      "DEM-003",
      "DEM-012",
      "DEM-013",
      "DEM-014",
      "DEM-015",
      "DEM-016",
    ]);
  });

  it("finds point codes and site names", () => {
    expect(
      searchPoints(records, "dem-005").map(({ point }) => point.name),
    ).toEqual(["East meadow"]);
    expect(
      searchPoints(records, "Willow Marsh").map(({ point }) => point.code),
    ).toEqual(["DEM-001", "DEM-002"]);
  });

  it("handles empty and unmatched searches", () => {
    expect(searchPoints(records, "  ")).toHaveLength(records.length);
    expect(searchPoints(records, "nothing-like-this")).toEqual([]);
  });

  it("resolves the shared site and multiple route memberships", () => {
    const record = records.find(({ point }) => point.id === "p-02");
    expect(record?.site?.name).toBe("Willow Marsh");
    expect(record?.routes.map((route) => route.name)).toEqual([
      "Medway A",
      "Medway C",
    ]);
  });
});

it("builds a Google Maps driving link to the exact coordinates", () => {
  const url = new URL(directionsUrl(demoData.points[0]));
  expect(url.origin).toBe("https://www.google.com");
  expect(url.searchParams.get("api")).toBe("1");
  expect(url.searchParams.get("destination")).toBe("51.3512,0.4783");
  expect(url.searchParams.get("travelmode")).toBe("driving");
});
