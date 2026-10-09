export type Catchment = { id: string; name: string };
export type Job = {
  id: string;
  catchmentId: string;
  name: string;
  code: string;
};
export type Route = {
  id: string;
  jobId: string;
  name: string;
  code: string;
  pointIds: string[];
};
export type Site = { id: string; name: string; code: string };
export type SamplingPoint = {
  id: string;
  siteId: string;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
};

export type LocationData = {
  catchments: Catchment[];
  jobs: Job[];
  routes: Route[];
  sites: Site[];
  points: SamplingPoint[];
};

export type PointRecord = {
  point: SamplingPoint;
  site: Site;
  routes: { route: Route; job: Job; catchment: Catchment }[];
  searchText: string;
};
