# Tech Maps

An online route and sampling-point finder built with React Router, Leaflet, and Cloudflare Workers static assets. See the [Sprint 2 brief](docs/sprint-02-development-brief.md) for scope and release gates.

## Local Medway review

Keep the reviewed source at `raw/medway-import.review.json`. The entire `raw/` directory is ignored by Git. Run `pnpm install` and `pnpm dev`, then open `http://127.0.0.1:5173/`. The dev server binds to loopback and loads the private JSON at runtime. If the file is missing or invalid, the local app reports an error instead of showing demo points. The exported route order is provisional until the route owner confirms it; site, job, and catchment relationships remain unknown.

On other hosts and in production builds, the app uses the synthetic fixture. Do not copy `raw/` into `public/`, source imports, or a public repository. A public Worker must not serve the real Medway coordinates or descriptions. The build checks `build/client` against the local review file for leaks.

## Commands

```sh
pnpm dev           # private local review on 127.0.0.1:5173
pnpm typecheck     # React Router types and TypeScript
pnpm test          # domain, route-order, and directions-link tests
pnpm format        # format source and docs
pnpm format:check  # verify formatting
pnpm build         # Workers SPA plus private-data leak check
```

`pnpm run deploy` remains the Cloudflare Workers deployment command. Deployment requires separate release approval; the current production build contains synthetic points. The PWA manifest and icons are included, but Android installation and Google Maps segment behaviour need checks in Edge and Chrome on an actual phone. The app needs network access for map tiles and does not support offline use.

## Map tiles

The default map uses OpenStreetMap's public tile server for low-volume prototype testing with visible attribution. Do not bulk-download tiles or use this endpoint for a production rollout. Set `VITE_STREET_TILE_URL` and `VITE_STREET_TILE_ATTRIBUTION` to use an approved provider. Satellite imagery remains out of scope.
