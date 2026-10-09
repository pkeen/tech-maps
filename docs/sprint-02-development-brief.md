# Tech Maps — Sprint 2 development brief

**Goal:** Replace the synthetic point finder with reviewed Medway data in an approved environment, and make the online Android experience feel like an installed app while remaining usable in Edge and Chrome browser tabs.

**Stack and deployment:** Keep React Router SPA, TypeScript, Leaflet, and Cloudflare Workers static assets. Keep the location domain in `app/domains/locations/`, map UI in `app/features/map/`, point UI in `app/features/point-finder/`, and mobile styling in `app/styles/`. Use small explicit types and functions. No database or service split.

## Data import and review gate

1. Review `raw/medway-kmz-audit.md` and `raw/medway-import.review.json` with the route owner. Confirm each exported folder sequence is the intended visiting order, the 29 coordinates and descriptions, and the meaning of each label. Resolve or deliberately leave unassigned the site, job, and catchment relationships. Correct any source errors only in an owner-approved mapping record; retain the raw KMZ and extraction output for traceability.
2. Keep `raw/` and real-data review files outside the published assets and any public repository. Until a hosting and access plan is approved, keep the current synthetic fixture in deployable builds. A Cloudflare Workers deployment remains the target, but a public prototype must contain no real point coordinates or access notes.
3. After review, introduce a production data module or JSON loader that validates unique IDs, coordinate bounds, references, duplicate route membership, and nonempty ordered `pointIds`. Do not sort route points by label, distance, or coordinates. Search results for a selected route must follow `route.pointIds`; ordinary global search may use a separate documented order.
4. Remove synthetic demo points from the **approved real-data build** and update demo labels and search examples accordingly. Preserve searching by catchment, route, point label, and any confirmed site name. Selecting a route should frame its markers; selecting a point should centre it and reveal details.
5. The current `LocationData` requires a job and site for every point. Decide the representation from owner evidence before connecting the staging JSON to it. Do not fabricate site names or create fake one-to-one sites to make the fixture compile. Where a relationship is truly unknown, the UI should say “Site not recorded” or equivalent.

## Android PWA and mobile experience

- Add a web app manifest in `public/` and link it from `app/root.tsx`. Define `name`, `short_name`, `id`, `start_url`, `scope`, `display: "standalone"`, theme/background colours, and app icons. Provide at least 192 × 192 and 512 × 512 PNG icons, including a maskable variant whose mark remains visible inside the safe area. Confirm the icon and name with the owner before release.
- Serve the app over HTTPS on Cloudflare Workers. Verify installability and standalone launch on representative Android devices in **both Edge and Chrome**. Test the ordinary browser-tab experience as a first-class path. Record whether managed-device policy, browser settings, or Google Maps availability alter install or launch behaviour. Installation prompts and home-screen wording vary by browser and device.
- A service worker is optional for this online-only sprint. If used for install or update behaviour, avoid precaching real location data or map tiles and verify that deployments replace old versions. Do not promise offline operation.
- Make route selection visible and easy to reach with touch. Keep point order numbered in the list, allow quick return from point details to the route list, and retain the exact coordinate and copy action for the final approach. Ensure map gestures do not trap scrolling, list actions have adequate touch targets, no horizontal overflow occurs at narrow widths, and keyboard focus and screen-reader names remain clear.
- Store only the last selected **route ID** in `localStorage`, under a versioned key such as `tech-maps:last-route:v1`. On load, restore it only if that ID still exists; otherwise choose a safe default. Handle blocked or unavailable storage without breaking the app. Do not store location, selected point, visit status, or sensitive notes. Test both browser-tab and standalone launches; their storage behaviour on managed devices must be observed rather than assumed.

## Full-route Google Maps link: evaluation

Google [Maps URLs](https://developers.google.com/maps/documentation/urls/get-started) support a directions URL with `api=1`, an optional origin, a destination, `travelmode=driving`, and `waypoints` separated by encoded pipes. Waypoints appear in URL order. A URL does **not** require a Google API key. Google documents up to **three waypoints on mobile browsers**, up to **nine otherwise**, a **2,048-character URL limit**, and products that may ignore waypoints. Route A/B/C have 8/10/11 points, so one reliable mobile-browser deep link cannot represent any complete route.

Build a small proof using reviewed, ordered point IDs and coordinate waypoints. Omit origin to let Google Maps use device location where available; use the final point as destination and preceding points as waypoints, with URL encoding via `URLSearchParams`. Test what actually opens from Edge, Chrome, and installed standalone mode on target Android phones: Maps app, browser route preview, navigation, or blocked action. Check whether all stops survive and retain order. Do not silently truncate a full route or label a partial link “Full route”. Google Maps computes road paths and may lead to a reachable road rather than the precise off-road sampling location.

**Fallback:** Keep the ordered route list and per-point **Open in Google Maps** action. A technician can open each next point individually. If the multi-stop test is useful, offer clearly labelled segments of at most the supported mobile stop count, with the segment boundary visible and a return path to Tech Maps. Do not introduce route optimisation or an API-backed directions service in this sprint.

## Acceptance checks

- Extraction is reproducible from the KMZ; the excluded driving folder contributes no point or geometry to the staging JSON. Counts are 8, 10, and 11, with 29 unique included labels and 28 descriptions. The owner signs off the route order and unresolved relationships before real data goes into an app build.
- Domain checks cover reference integrity, coordinates, stable IDs, and exact `pointIds` sequence. Route search and selection show points in that sequence; point details preserve source description text and coordinates.
- Mobile checks cover narrow Android viewport, touch selection, map/list coordination, search, denied location permission, copy coordinates, and single-point navigation fallback.
- Edge and Chrome checks on representative managed Android phones cover HTTPS loading, manifest/icon display, installation or add-to-home-screen flow, standalone launch, app return/navigation, last-route restoration, and normal tab use. Record browser/device versions and policy restrictions.
- Test the proposed multi-stop link on device and record how many stops actually appear, their order, and whether navigation launches. Ship only wording and controls supported by those results.
- Run `pnpm typecheck`, `pnpm test`, `pnpm format:check`, and `pnpm build`. Inspect `build/client` before Cloudflare deployment to confirm real point data and access notes are absent unless the approved access-controlled release is ready.

## Outside Sprint 2

Offline maps or location data, a point-editing UI, authentication, completion tracking, route optimisation, and a database. These are not prerequisites for the browser and PWA experience described here.

## References

- [Google Maps URLs directions and waypoint limits](https://developers.google.com/maps/documentation/urls/get-started)
- [Google PWA installation overview](https://web.dev/learn/pwa/installation)
- [Microsoft Edge PWA development guide](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps/how-to/)
- [Microsoft Edge PWA manifest inspection](https://learn.microsoft.com/en-us/microsoft-edge/devtools/progressive-web-apps/)
