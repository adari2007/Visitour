# Quick Start

This repo is frontend-only (Web + Mobile) and talks to external `../VisitourAPI`.

## 1) Install dependencies

```bash
cd Visitour
yarn install
```

## 2) Configure environment

```bash
cp apps/web/.env.example apps/web/.env
cp apps/mobile/.env.example apps/mobile/.env
```

Set values:

```env
# apps/web/.env
VITE_API_URL=http://localhost:3000/api

# apps/mobile/.env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

## 3) Start VisitourAPI (separate repo)

```bash
cd ../VisitourAPI
# run API using VisitourAPI's own instructions
```

## 4) Start clients

```bash
# web
yarn dev:web

# mobile
yarn dev:mobile
```

## Access

- Web: http://localhost:5173
- API target: http://localhost:3000/api

## Troubleshooting

- Ensure VisitourAPI is running
- Ensure env values include `/api`
- Restart web/mobile after env changes
