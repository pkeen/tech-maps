import { readFile, writeFile } from "node:fs/promises";

const source = JSON.parse(
  await readFile("raw/medway-import.review.json", "utf8"),
);
const points = source.points.map((point) => ({
  id: point.id,
  projectId: "medway",
  siteId: null,
  name: point.label,
  latitude: point.latitude,
  longitude: point.longitude,
  description: point.description,
}));
const routes = source.routes.map((route) => ({
  id: route.id,
  projectId: "medway",
  name: route.name,
  pointIds: [...route.pointIds],
}));
const pointIds = new Set(points.map((point) => point.id));
const memberships = routes.flatMap((route) => route.pointIds);

if (
  points.length !== 29 ||
  routes.map((route) => route.pointIds.length).join(",") !== "8,10,11" ||
  new Set(memberships).size !== memberships.length ||
  memberships.length !== pointIds.size ||
  memberships.some((id) => !pointIds.has(id)) ||
  points.some(
    (point) =>
      !Number.isFinite(point.latitude) ||
      Math.abs(point.latitude) > 90 ||
      !Number.isFinite(point.longitude) ||
      Math.abs(point.longitude) > 180,
  )
) {
  throw new Error("The private Medway review file failed publication checks");
}

const data = {
  projects: [{ id: "medway", name: "Medway" }],
  sites: [],
  routes,
  points,
};
const serialized = JSON.stringify(data);
if (
  data.points.some((point) => typeof point.description !== "string") ||
  routes.some((route) => route.projectId !== "medway") ||
  points.some((point) => point.siteId !== null)
) {
  throw new Error(
    "The prepared Medway data changed reviewed unknown relationships",
  );
}

await writeFile(
  "app/domains/locations/medway-data.generated.ts",
  `import type { LocationData } from "./model";\n\nconst data = ${serialized} satisfies LocationData;\n\nexport default data;\n`,
);
console.log(
  `Prepared public Medway data: ${points.length} points, ${points.filter((point) => point.description).length} descriptions, route order retained.`,
);
