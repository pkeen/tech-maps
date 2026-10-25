import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const output = "build/client";
const reviewFile = "raw/medway-import.review.json";
const publicMedway = process.env.VITE_PUBLIC_MEDWAY_DATA === "true";

if (publicMedway && process.env.ALLOW_REAL_DATA !== "1") {
  throw new Error(
    "Public Medway inclusion requires the explicit ALLOW_REAL_DATA=1 deployment gate",
  );
}

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? filesIn(path) : [path];
    }),
  );
  return nested.flat();
}

const files = await filesIn(output);
if (files.some((path) => /medway-import|\.kmz$/i.test(path))) {
  throw new Error("Private Medway source file found in the public build");
}

let review;
try {
  review = JSON.parse(await readFile(reviewFile, "utf8"));
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
  if (publicMedway)
    throw new Error("Public Medway build requires the private review file");
  console.log(
    "Public build check: private review file absent; file names checked.",
  );
  process.exit(0);
}

const assets = await Promise.all(
  files.map(async (path) => [path, (await readFile(path)).toString("utf8")]),
);
const allText = assets.map(([, text]) => text).join("\n");

if (publicMedway) {
  for (const point of review.points) {
    const lat = String(point.latitude);
    const lon = String(point.longitude);
    const coordinateVariants = (value) =>
      value.startsWith("0.") ? [value, value.slice(1)] : [value];
    if (
      !coordinateVariants(lat).some((variant) => allText.includes(variant)) ||
      !coordinateVariants(lon).some((variant) => allText.includes(variant)) ||
      !allText.includes(point.label)
    ) {
      throw new Error("Public build is missing a reviewed Medway point");
    }
    if (point.description && !allText.includes(point.description)) {
      throw new Error("Public build is missing a reviewed Medway description");
    }
  }
  console.log(
    `Public build check: all ${review.points.length} reviewed locations and ${review.points.filter((point) => point.description).length} descriptions are included.`,
  );
  process.exit(0);
}

const markers = review.points
  .flatMap((point) => [
    String(point.latitude),
    String(point.longitude),
    point.description?.trim(),
  ])
  .filter((value) => value && value.length >= 6);

for (const [path, text] of assets) {
  if (markers.some((marker) => text.includes(marker))) {
    throw new Error(
      `Private Medway content found in public build asset: ${path}`,
    );
  }
}

console.log(
  `Public build check: ${files.length} assets contain no reviewed coordinates or descriptions.`,
);
