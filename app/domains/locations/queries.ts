import type { LocationData, PointRecord, Route, SamplingPoint } from "./model";

export function buildPointRecords(data: LocationData): PointRecord[] {
  const projects = new Map(data.projects.map((item) => [item.id, item]));
  const sites = new Map(data.sites.map((item) => [item.id, item]));

  return data.points.map((point) => {
    const project = projects.get(point.projectId);
    if (!project) throw new Error(`Missing project for ${point.id}`);
    const site = point.siteId === null ? null : sites.get(point.siteId);
    if (point.siteId !== null && !site)
      throw new Error(`Missing site for ${point.id}`);
    const routes = data.routes.filter((route) =>
      route.pointIds.includes(point.id),
    );
    const searchText = [
      point.name,
      point.code,
      site?.name,
      site?.code,
      project.name,
      project.code,
      ...routes.flatMap((route) => [route.name, route.code]),
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();
    return { point, project, site: site ?? null, routes, searchText };
  });
}

export function searchPoints(
  records: PointRecord[],
  query: string,
): PointRecord[] {
  const normalized = query.trim().toLocaleLowerCase().replace(/\s+/g, " ");
  const words = normalized.split(" ").filter(Boolean);
  if (words.length === 0) return records;
  return records.filter((record) => {
    if (record.searchText.includes(normalized)) return true;
    return words.every(
      (word) => word.length > 1 && record.searchText.includes(word),
    );
  });
}

// Route order comes from pointIds, never from the global point array or a sort.
export function recordsForRoute(
  records: PointRecord[],
  route: Route,
): PointRecord[] {
  const byId = new Map(records.map((record) => [record.point.id, record]));
  return route.pointIds
    .map((id) => byId.get(id))
    .filter((record): record is PointRecord => Boolean(record));
}

export function directionsUrl(point: SamplingPoint): string {
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("destination", `${point.latitude},${point.longitude}`);
  url.searchParams.set("travelmode", "driving");
  return url.toString();
}

// A mobile Maps URL supports at most three waypoints plus the destination.
export function segmentDirectionsUrl(points: SamplingPoint[]): string {
  if (points.length < 2 || points.length > 4)
    throw new Error("A test segment needs 2–4 stops");
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  const destination = points.at(-1)!;
  url.searchParams.set(
    "destination",
    `${destination.latitude},${destination.longitude}`,
  );
  url.searchParams.set("travelmode", "driving");
  url.searchParams.set(
    "waypoints",
    points
      .slice(0, -1)
      .map((point) => `${point.latitude},${point.longitude}`)
      .join("|"),
  );
  if (url.toString().length > 2048)
    throw new Error("Google Maps URL exceeds 2,048 characters");
  return url.toString();
}

export function routeSegments(records: PointRecord[]): PointRecord[][] {
  const segments: PointRecord[][] = [];
  for (let offset = 0; offset < records.length; offset += 4)
    segments.push(records.slice(offset, offset + 4));
  return segments;
}

export function validateLocationData(data: LocationData): string[] {
  const errors: string[] = [];
  for (const [kind, records] of Object.entries({
    project: data.projects,
    site: data.sites,
    route: data.routes,
    point: data.points,
  })) {
    const seen = new Set<string>();
    for (const record of records) {
      if (!record.id || seen.has(record.id))
        errors.push(`${kind}: missing or duplicate ID ${record.id}`);
      seen.add(record.id);
    }
  }
  const projectIds = new Set(data.projects.map(({ id }) => id));
  const siteIds = new Set(data.sites.map(({ id }) => id));
  const pointIds = new Set(data.points.map(({ id }) => id));
  for (const site of data.sites)
    if (!projectIds.has(site.projectId))
      errors.push(`${site.id}: missing project`);
  for (const route of data.routes) {
    if (!projectIds.has(route.projectId))
      errors.push(`${route.id}: missing project`);
    if (route.pointIds.length === 0) errors.push(`${route.id}: empty route`);
    const seen = new Set<string>();
    for (const pointId of route.pointIds) {
      if (!pointIds.has(pointId))
        errors.push(`${route.id}: missing point ${pointId}`);
      if (seen.has(pointId))
        errors.push(`${route.id}: duplicate point ${pointId}`);
      seen.add(pointId);
    }
  }
  for (const point of data.points) {
    if (!projectIds.has(point.projectId))
      errors.push(`${point.id}: missing project`);
    if (point.siteId !== null && !siteIds.has(point.siteId))
      errors.push(`${point.id}: missing site`);
    if (!point.name.trim()) errors.push(`${point.id}: missing label`);
    if (
      !Number.isFinite(point.latitude) ||
      Math.abs(point.latitude) > 90 ||
      !Number.isFinite(point.longitude) ||
      Math.abs(point.longitude) > 180
    )
      errors.push(`${point.id}: invalid coordinates`);
  }
  return errors;
}
