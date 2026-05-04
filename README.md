# Visitour - Web + Mobile Client

Visitour is the frontend client repository (Web + Mobile).

Backend APIs are provided by a separate sibling project: `../VisitourAPI`.

## What Is In This Repo

- `apps/web` - React + Vite web app
- `apps/mobile` - Expo React Native app
- `packages/shared` - Shared frontend types/utilities

## Prerequisites

- Node.js 18+
- Yarn 3+
- Running VisitourAPI service (from `../VisitourAPI`)

## Quick Start

1. Install dependencies:

```bash
cd Visitour
yarn install
```

2. Configure Web env:

```bash
cp apps/web/.env.example apps/web/.env
```

Set in `apps/web/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

3. Configure Mobile env:

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

Set in `apps/mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

4. Start backend (separate repo):

```bash
cd ../VisitourAPI
# run VisitourAPI with its own setup
```

5. Start frontend apps:

```bash
# web
yarn dev:web

# mobile
yarn dev:mobile
```

## URLs

- Web: `http://localhost:5173`
- API expected by frontend: `http://localhost:3000/api`

## Build

```bash
yarn build:web
yarn build:mobile
```

## Notes

- This repo does not run a local backend service.
- If API calls fail, verify `VITE_API_URL` / `EXPO_PUBLIC_API_URL` and VisitourAPI status.
