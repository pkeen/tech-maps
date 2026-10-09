# Tech Maps · Sprint 1

A mobile-first, synthetic sampling-point finder for testing in Microsoft Edge on Android. The project follows [the Sprint 1 brief](docs/sprint-01-development-brief.md). All names, codes, and point coordinates in the demo are invented and must not be replaced with operational locations in a public build.

## Local development

Requires Node.js 20 or later and pnpm.

```sh
pnpm install
pnpm dev
```

Open `http://localhost:5173`. The app does not need a Google account. Location requires a secure context (HTTPS or localhost) and browser permission; search and map use continue if permission is denied.

```sh
pnpm typecheck      # generate React Router types and check TypeScript
pnpm test           # domain and directions-link unit tests
pnpm build          # produce the SPA in build/client
pnpm format:check   # check formatting
```

## Map tiles

The default street map uses OpenStreetMap's public tile server for low-volume prototype testing. The map displays OSM attribution and uses normal browser caching and referrer behavior. Do not bulk download tiles or use this public endpoint for a production rollout. Set `VITE_STREET_TILE_URL` and `VITE_STREET_TILE_ATTRIBUTION` to switch to an approved tile provider. Satellite imagery is intentionally absent until a provider and its licence, attribution, limits, and configuration are agreed.

## Cloudflare test deployment

`wrangler.jsonc` serves `build/client` as a Cloudflare Workers SPA. After authenticating Wrangler to the owner's Cloudflare account, run:

```sh
pnpm run deploy
```

Then open the HTTPS URL in Edge on a representative managed Android phone and verify map tiles, markers, search, point details, the Google Maps action, and the denied-location state. Record any device-policy restrictions before expanding the test. Never deploy real company site or sampling-point data from this prototype.
