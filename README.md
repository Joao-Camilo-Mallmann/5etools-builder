# 5etools Builder

A React + TypeScript app to build D&D 5e characters using public data from the 5etools repository.

## Requirements

- Node.js 20+
- npm 10+

## Running Locally

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open the URL shown in the terminal (usually `http://localhost:5173`).

## Scripts

- `npm run dev`: start Vite in development mode.
- `npm run build`: create a production build.
- `npm run preview`: preview the production build locally.
- `npm run lint`: run ESLint.

## Project Structure

- `src/components`: UI and wizard flow.
- `src/hooks`: hooks for fetching and caching data.
- `src/services`: data integration and transformation.
- `src/store`: global character state (Zustand).
- `src/types`: app and upstream type definitions.

## Data Source

Data is fetched from public JSON files in the 5etools mirror:

- Repositório: https://github.com/5etools-mirror-3/5etools-src
- Base raw: https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/refs/heads/main/data
