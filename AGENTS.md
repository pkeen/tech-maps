# Repository Guidelines

## Project Structure & Module Organization

This repository is an early scaffold. The implementation brief is in `docs/sprint-01-development-brief.md`; read it before adding features. `app/routes/`, `app/shared/`, `app/styles/`, and `tests/` currently contain placeholders. Follow the brief's proposed layout as the app grows: put location types, synthetic fixtures, and queries in `app/domains/locations/`; map UI in `app/features/map/`; and search, results, and point details in `app/features/point-finder/`. Keep code near the feature that uses it.

## Build, Test, and Development Commands

No package manifest or runnable scripts exist yet. When setting up the React Router v7 SPA, add scripts for local development, TypeScript checking, formatting, tests, and a production build. Document their exact commands in the package manifest and keep them working before submitting changes. The intended deployment target is a Cloudflare Workers test environment.

## Coding Style & Naming Conventions

Use TypeScript and straightforward React components. Prefer two-space indentation, descriptive kebab-case file names such as `demo-data.ts`, and PascalCase component names. Keep domain relationships in explicit types and small pure functions. Share a helper only when it has at least two real uses. Configure a formatter during setup and run it on changed files.

## Testing Guidelines

Place domain tests and focused browser checks in `tests/`; name test files `*.test.ts` or `*.test.tsx`. Choose and document test runners when the app is initialized. Cover parent-name search, point codes, sites, empty results, missing references, and invalid coordinates. Browser checks should exercise point selection, the Google Maps directions URL, and denied location permission. Verify the layout on a narrow Android screen.

## Commit & Pull Request Guidelines

There is no Git history in this directory, so no established commit convention can be inferred. Use short, imperative commit subjects that describe the change. Pull requests should summarize behavior, list checks run, link a relevant issue when one exists, and include screenshots for UI changes.

## Data and Deployment Safety

Use clearly labelled synthetic locations only. Do not commit real company sampling points or publish them in a demo build. Confirm tile-provider terms, attribution, and configuration before adding satellite imagery.
