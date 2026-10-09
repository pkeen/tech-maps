# Sprint 1 test record

## Completed locally

- `pnpm test`: seven domain and directions-link checks passed.
- `pnpm typecheck`, `pnpm format:check`, and `pnpm build`: passed.
- `wrangler deploy --dry-run`: accepted the Workers static-asset configuration and read the SPA output.
- Chrome browser check: `Medway A` showed eight points; choosing one displayed its site, route/job, exact coordinates, and a Google Maps URL containing those coordinates and driving mode.
- At a 390 × 844 viewport, the search, results, map, attribution, details, and both point actions were usable without page-wide horizontal overflow. The copy action reported success.
- When browser location could not be obtained, the app showed a status message and search and map remained usable.

## Still required on the target device

Deploy to the owner's Cloudflare Workers account, then check the HTTPS URL in Edge on a representative work-managed Android phone. Confirm tile and marker loading, route search, point selection, the Google Maps action, and the location-permission result. Record any device-policy restrictions observed there.
