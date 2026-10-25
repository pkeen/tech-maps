# Sprint 2 test record

## Local checks

- Reviewed import: 29 unique points across Medway A/B/C (8/10/11). The test compares each route's `pointIds` with the source array in exact order, checks 28 descriptions, and confirms null site/job relationships.
- Chrome desktop local review: route selection, numbered mobile list, point detail and return, route restoration after reload, and 390 px layout without horizontal document overflow checked. A selected point centres the map. This is responsive browser testing, not Android device testing.
- `pnpm typecheck`, `pnpm test` (10 passed), `pnpm format:check`, `pnpm build`, and `git diff --check`: passed on 9 October 2026. React Router printed future-flag notices during the build.
- Synthetic public build: `scripts/check-public-build.mjs` scans for reviewed coordinates and descriptions. The raw JSON stays in ignored `raw/`.
- Owner has authorized publishing the 29 Medway point labels, coordinates, exported route order, and descriptions. Route order remains labelled provisional; site/job/catchment relationships remain unknown.
- Public build scan verifies all 29 locations and 28 source descriptions. The Wrangler publish step could not resolve `api.cloudflare.com` in this environment; its temporary generated source file was removed. The live Worker was not updated by this attempt.

## Android device checks still required

Use a representative managed Android phone. Record device model, Android version, Edge and Chrome versions, and any work-profile or policy restrictions. A screen recording or mirroring is optional; observed results can be reported in writing.

1. Open the HTTPS Worker in Edge and Chrome. Check normal tab use, manifest/icon, install or add-to-home-screen, standalone launch, and return to the app. Confirm the last selected route survives tab reload and standalone relaunch where storage is available.
2. In the approved private Medway environment, check route and point selection, ordered vertical list, page scrolling across the map, two-finger pinch zoom, search, exact coordinate copy, and denied location permission.
3. Open a **Test stops X–Y of N** segment in each browser and standalone mode. Record whether Maps opens in the app or browser, which stops appear, their order, and whether navigation starts. Verify the single-point **Open in Google Maps** fallback. Do not describe a segment as a full route.

## Release decisions

- Route owner: confirm or correct the exported order, all 29 coordinates, and what the labels mean. Confirm whether unknown site, job, and catchment relationships should stay unassigned.
- Tech Maps name/icon and map tile provider still need owner confirmation before broader rollout.
