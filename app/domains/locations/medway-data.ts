import type { LocationData } from "./model";
import { parseReviewedImport } from "./review-data";

// Globs the gitignored raw/ review file so this module (and the build) work
// whether or not it exists locally. When present, Vite inlines its content
// directly into the built JS — the real data ships in the bundle, never in git.
const modules = import.meta.glob("../../../raw/medway-import.review.json", {
  eager: true,
  import: "default",
});

function load(): LocationData | null {
  const raw = Object.values(modules)[0];
  if (!raw) return null;
  try {
    return parseReviewedImport(raw);
  } catch (error) {
    console.error("Local Medway review file failed validation:", error);
    return null;
  }
}

export const medwayData = load();
