import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const output = "build/client";
const reviewFile = "raw/medway-import.review.json";

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
  console.log(
    "Public build check: private review file absent; file names checked.",
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

for (const path of files) {
  const body = await readFile(path);
  const text = body.toString("utf8");
  if (markers.some((marker) => text.includes(marker))) {
    throw new Error(
      `Private Medway content found in public build asset: ${path}`,
    );
  }
}

console.log(
  `Public build check: ${files.length} assets contain no reviewed coordinates or descriptions.`,
);
