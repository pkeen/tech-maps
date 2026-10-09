export type Project = { id: string; name: string; code?: string };
export type Site = {
  id: string;
  projectId: string;
  name: string;
  code?: string;
};
export type Route = {
  id: string;
  projectId: string;
  name: string;
  code?: string;
  pointIds: string[];
};
export type SamplingPoint = {
  id: string;
  projectId: string;
  siteId: string | null;
  name: string;
  code?: string;
  description?: string;
  latitude: number;
  longitude: number;
};

export type LocationData = {
  projects: Project[];
  sites: Site[];
  routes: Route[];
  points: SamplingPoint[];
};

export type PointRecord = {
  point: SamplingPoint;
  project: Project;
  site: Site | null;
  routes: Route[];
  searchText: string;
};
