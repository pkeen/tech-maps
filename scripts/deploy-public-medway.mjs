import { spawnSync } from "node:child_process";
import { rm } from "node:fs/promises";

const generatedFile = "app/domains/locations/medway-data.generated.ts";
const packageManager = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const publicBuildEnv = {
  ...process.env,
  ALLOW_REAL_DATA: "1",
  VITE_PUBLIC_MEDWAY_DATA: "true",
};

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, { env, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(
      `${command} ${args.join(" ")} failed with status ${result.status}`,
    );
}

try {
  run(process.execPath, ["scripts/prepare-public-medway.mjs"]);
  run(packageManager, ["build"], publicBuildEnv);
  run(packageManager, ["exec", "wrangler", "deploy"], publicBuildEnv);
} finally {
  await rm(generatedFile, { force: true });
}
