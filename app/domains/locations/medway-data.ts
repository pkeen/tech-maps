import type { LocationData } from "./model";
import { parseReviewedImport } from "./review-data";

// Only the sanitized generated module can enter a public build. Its generator
// deliberately excludes operational descriptions and other review metadata.
const publicMedwayModules = import.meta.glob<LocationData>(
  "./medway-data.generated.ts",
  { eager: true, import: "default" },
);

export async function loadMedwayData(): Promise<LocationData | null> {
  if (import.meta.env.DEV) {
    if (!["localhost", "127.0.0.1"].includes(window.location.hostname)) {
      return null;
    }
    const response = await fetch("/raw/medway-import.review.json", {
      cache: "no-store",
    });
    if (!response.ok)
      throw new Error("Local reviewed data file could not be loaded");
    return parseReviewedImport(await response.json());
  }

  if (import.meta.env.VITE_PUBLIC_MEDWAY_DATA === "true") {
    const data = Object.values(publicMedwayModules)[0];
    if (!data)
      throw new Error("Public Medway data was not prepared for this build");
    return data;
  }

  return null;
}
