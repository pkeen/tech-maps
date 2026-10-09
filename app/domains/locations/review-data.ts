import type { LocationData, Route, SamplingPoint } from "./model";
import { validateLocationData } from "./queries";

type JsonRecord = Record<string, unknown>;

function record(value: unknown, label: string): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(`${label} must be an object`);
  return value as JsonRecord;
}

function array(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array`);
  return value;
}

function string(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`${label} must be a nonempty string`);
  return value;
}

// This import is entirely Medway's; the project assignment is a structural
// fact, not a reviewed relationship, so it does not wait on owner sign-off.
const PROJECT_ID = "medway";
const PROJECT_NAME = "Medway";

// Converts the ignored, local review artifact without creating site records.
export function parseReviewedImport(input: unknown): LocationData {
  const source = record(input, "review import");
  if (array(source.sites, "sites").length !== 0)
    throw new Error("sites need a separately approved mapping");
  const routes: Route[] = array(source.routes, "routes").map((item, index) => {
    const route = record(item, `route ${index + 1}`);
    return {
      id: string(route.id, "route ID"),
      name: string(route.name, "route name"),
      projectId: PROJECT_ID,
      pointIds: array(route.pointIds, "route pointIds").map((id) =>
        string(id, "point ID"),
      ),
    };
  });
  const points: SamplingPoint[] = array(source.points, "points").map(
    (item, index) => {
      const point = record(item, `point ${index + 1}`);
      if (point.siteId !== null)
        throw new Error("Review points must have unknown site relationships");
      if (
        typeof point.latitude !== "number" ||
        typeof point.longitude !== "number" ||
        typeof point.description !== "string"
      ) {
        throw new Error(
          `Point ${index + 1} has invalid coordinates or description`,
        );
      }
      return {
        id: string(point.id, "point ID"),
        name: string(point.label, "point label"),
        latitude: point.latitude,
        longitude: point.longitude,
        description: point.description,
        projectId: PROJECT_ID,
        siteId: null,
      };
    },
  );
  const data: LocationData = {
    projects: [{ id: PROJECT_ID, name: PROJECT_NAME }],
    sites: [],
    routes,
    points,
  };
  const errors = validateLocationData(data);
  const memberships = routes.flatMap((route) => route.pointIds);
  if (new Set(memberships).size !== memberships.length)
    errors.push("Point is assigned to multiple review routes");
  if (memberships.length !== points.length)
    errors.push("Review points and route membership counts differ");
  if (errors.length) throw new Error(errors.join("; "));
  return data;
}
