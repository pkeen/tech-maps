# Tech Maps — Sprint 1 development brief

**Goal:** A mobile-first map prototype that helps a technician find a sampling point and open driving directions to its coordinates.

**Target:** Microsoft Edge on Android, opened from a normal HTTPS link. No app installation or Google account is required to view the Tech Maps interface.

**Stack:** React Router v7 in SPA mode, TypeScript, Leaflet, and a Cloudflare Workers test deployment. Use a street-map tile provider with suitable usage terms and attribution. Styling should be simple and responsive; a CSS framework is optional.

## Scope

1. Show a street map with tappable sampling-point markers and a matching list for small screens.
2. Search across catchment, job, route, site, and sampling-point names or codes. A search for `Medway` or `Medway A` should find the associated points, even when those words are not in each point's own name.
3. Let a technician choose a point and see its name, code, site, route or job context, and exact latitude/longitude.
4. Provide an **Open in Google Maps** action using the point's coordinates and driving mode. Google Maps chooses the reachable road destination; the Tech Maps marker and coordinates remain available for the final approach to an off-road point. If Google Maps is unavailable or blocked on a managed phone, the coordinates remain visible and copyable.
5. Offer **Use my location** to show the device position when the technician grants browser permission. Search and map use must still work when permission is denied.
6. Make a satellite layer available only if a provider and its licence, attribution, usage limits, and deployment configuration are confirmed. Otherwise ship the street map alone; never use Google imagery as arbitrary Leaflet tiles.
7. Deploy the prototype to the owner's Cloudflare Workers account for testing on at least one work-managed Android phone. Keep all published points and site information fictitious.

## Domain and data

```text
Catchment → Job → Route → route membership → Sampling point
                                           ↘ Site (physical place)
```

| Concept | Meaning |
| --- | --- |
| Catchment | Geographic or operational grouping, such as Medway. |
| Job | Sampling programme within a catchment. |
| Route | Named set of visits within a job, such as Medway A. |
| Site | Physical place, independent of the job hierarchy; it may hold several points and be used by more than one job. |
| Sampling point | Exact location to visit, with a stable code, coordinates, and a site reference. |

Use stable IDs and explicit references between records. Route membership should reference point IDs rather than duplicate point coordinates. Keep the relationship rules in plain TypeScript types and small functions; do not add a database or generic repository layer for static fixtures. Include a small, clearly labelled **synthetic** data set with multiple jobs, three Medway-labelled demo routes, several points per route, and a site containing more than one point. Its coordinates must not represent actual company sampling locations.

## Suggested file layout

```text
app/
  routes/                 # page entry and route configuration
  domains/locations/
    model.ts              # Catchment, Job, Route, Site, SamplingPoint types
    demo-data.ts          # synthetic records and relationships
    queries.ts            # search, filtering, and lookups
  features/map/           # Leaflet map, markers, layer control, GPS
  features/point-finder/  # search, results, point details, navigation action
  shared/                 # only genuinely reused UI and helpers
  styles/                 # mobile-first styles
tests/                    # domain tests and focused browser checks
```

Keep files close to the feature that uses them, prefer descriptive names and straightforward React components, and avoid abstraction until two real uses justify it. The map should receive prepared point data; search and relationship logic should be testable without rendering Leaflet.

## Delivery sequence

1. Set up the React Router SPA, TypeScript checks, formatting, and a single responsive page.
2. Add typed synthetic data, relationship lookups, and search.
3. Add the Leaflet street map, markers, results list, and point details.
4. Add GPS permission handling and the Google Maps directions link.
5. Check the mobile layout, accessibility basics, and browser behaviour; deploy the test build to Cloudflare Workers.
6. Add satellite imagery only after a suitable provider is approved and configured.

## Tests and acceptance

- Unit tests cover case-insensitive search through parent names (`Medway`, `Medway A`), point code and site matches, empty results, and relationship lookups. Fixture checks reject missing references or invalid coordinates.
- A focused browser check covers searching, choosing a result, opening its marker/details, a correctly encoded Google Maps URL, and the denied-GPS state.
- On a narrow Android screen, search, list, map, and point actions are usable by touch without horizontal scrolling. Keyboard focus, button labels, marker alternatives through the list, and map attribution are visible or accessible.
- In Edge on a representative managed Android phone, the HTTPS test URL loads, map tiles and markers appear, search works, and the navigation link can be exercised. Record any device-policy or Google Maps restriction as a test finding.
- No real company locations or access instructions appear in the repository's public demo data or deployed build. Type checking, tests, and production build pass.

## Later work

Offline maps and data, site or vehicle access points, coordinator editing, persistent storage or SharePoint integration, and Microsoft Entra authentication are outside Sprint 1. Real company data requires an approved hosting and access-control plan before publication.
