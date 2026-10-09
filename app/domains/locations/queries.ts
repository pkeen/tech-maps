import type { LocationData, PointRecord, SamplingPoint } from "./model";

export function buildPointRecords(data: LocationData): PointRecord[] {
  const catchments = new Map(data.catchments.map((item) => [item.id, item]));
  const jobs = new Map(data.jobs.map((item) => [item.id, item]));
  const sites = new Map(data.sites.map((item) => [item.id, item]));

  return data.points.map((point) => {
    const site = sites.get(point.siteId);
    if (!site) throw new Error(`Missing site for ${point.id}`);
    const routes = data.routes
      .filter((route) => route.pointIds.includes(point.id))
      .map((route) => {
        const job = jobs.get(route.jobId);
        if (!job) throw new Error(`Missing job for ${route.id}`);
        const catchment = catchments.get(job.catchmentId);
        if (!catchment) throw new Error(`Missing catchment for ${job.id}`);
        return { route, job, catchment };
      });
    const searchText = [
      point.name,
      point.code,
      site.name,
      site.code,
      ...routes.flatMap(({ route, job, catchment }) => [
        route.name,
        route.code,
        job.name,
        job.code,
        catchment.name,
      ]),
    ]
      .join(" ")
      .toLocaleLowerCase();
    return { point, site, routes, searchText };
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

export function directionsUrl(point: SamplingPoint): string {
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("destination", `${point.latitude},${point.longitude}`);
  url.searchParams.set("travelmode", "driving");
  return url.toString();
}

export function validateLocationData(data: LocationData): string[] {
  const errors: string[] = [];
  const catchmentIds = new Set(data.catchments.map(({ id }) => id));
  const jobIds = new Set(data.jobs.map(({ id }) => id));
  const siteIds = new Set(data.sites.map(({ id }) => id));
  const pointIds = new Set(data.points.map(({ id }) => id));
  for (const job of data.jobs)
    if (!catchmentIds.has(job.catchmentId))
      errors.push(`${job.id}: missing catchment`);
  for (const route of data.routes) {
    if (!jobIds.has(route.jobId)) errors.push(`${route.id}: missing job`);
    for (const pointId of route.pointIds)
      if (!pointIds.has(pointId))
        errors.push(`${route.id}: missing point ${pointId}`);
  }
  for (const point of data.points) {
    if (!siteIds.has(point.siteId)) errors.push(`${point.id}: missing site`);
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
