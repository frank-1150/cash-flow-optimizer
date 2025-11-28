# Deployment Guide

This application is a static Single Page Application (SPA) built with Vite and React. It can be deployed to any static hosting provider.

## Prerequisites

- Node.js installed (v18+ recommended)
- npm installed

## Build for Production

To create a production build, run:

```bash
npm run build
```

This will generate a `dist/` directory containing the compiled HTML, CSS, and JavaScript files.

## Hosting Options

### 1. Vercel (Recommended)

1.  Install Vercel CLI: `npm i -g vercel`
2.  Run `vercel` in the project root.
3.  Follow the prompts. Vercel detects Vite automatically.

### 2. Netlify

1.  Drag and drop the `dist/` folder to the Netlify dashboard.
2.  Or connect your Git repository and set the build command to `npm run build` and publish directory to `dist`.

### 3. GitHub Pages

1.  Update `vite.config.ts` to set the base URL if you are deploying to a subdirectory (e.g., `https://<USERNAME>.github.io/<REPO>/`):
    ```typescript
    export default defineConfig({
      base: '/<REPO>/',
      plugins: [react()],
    })
    ```
2.  Push your code to GitHub.
3.  Configure GitHub Pages in repository settings to serve from the `gh-pages` branch (you can use the `gh-pages` package to deploy).

## Local Preview

To preview the production build locally:

```bash
npm run preview
```
