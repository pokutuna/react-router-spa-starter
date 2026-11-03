# React Router SPA Template

A modern template for building single-page applications with React Router, TypeScript, and Tailwind CSS. Pre-configured for GitHub Pages deployment.

**Demo**: https://pokutuna.github.io/react-router-spa-starter/

## Features

- React Router (SPA mode), React, TypeScript
- Tailwind CSS, Vite
- Biome (linting and formatting)
- GitHub Pages ready with auto base path detection
- GitHub Actions for deployment and testing
- Dependabot with a release cooldown and patch auto-merge

## Quick Start

```bash
# Use this template on GitHub, then clone
npm install
npm run dev
```

Open http://localhost:5173

## Commands

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Build and preview the production output locally
npm run typecheck # Type checking
npm run check     # Lint + format with auto-fix
```

## Deployment

Fork this repository and enable GitHub Pages in repository settings. The `.github/workflows/deploy-pages.yml` workflow automatically deploys on push to main.

Base path is auto-detected from repository name via `GITHUB_REPOSITORY` environment variable.

GitHub Pages serves `404.html` for unknown paths, so the build copies `index.html` to `404.html` (see `buildEnd` in `react-router.config.ts`). This lets direct visits and reloads on sub-routes load the app.

## Adding Routes

1. Create `app/routes/[name].tsx` with default export
2. Add route to `app/routes.ts`

Example:

```typescript
// app/routes/about.tsx
export default function About() {
  return <div>About Page</div>;
}
```

```typescript
// app/routes.ts
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("about", "routes/about.tsx"),
] satisfies RouteConfig;
```

## Project Structure

```
app/
├── components/      # Shared components
├── routes/          # Route components
├── root.tsx         # Root layout
├── routes.ts        # Route configuration
└── app.css          # Global styles with Tailwind theme
```

## Dependency Updates

- Dependabot opens weekly update PRs (`.github/dependabot.yml`). The `react-router` packages are grouped because they must be upgraded together.
- Releases are not adopted until they have aged for a cooldown period, as a supply-chain mitigation: `cooldown.default-days` in `dependabot.yml` and `min-release-age` in `.npmrc`. Keep the two values in sync.
- Patch updates are auto-merged once the Test workflow passes (`.github/workflows/dependabot-auto-merge.yml`). Other updates need a manual review.
- Node.js version is pinned in `.node-version`.

CI only runs type checking and a build (lint runs but does not fail the job). See [docs/dependency-upgrade-checklist.md](docs/dependency-upgrade-checklist.md) for what to verify by hand when upgrading.

## License

MIT
