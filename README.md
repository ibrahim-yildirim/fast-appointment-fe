# Fast Appointment – Frontend

Web app for booking appointments with service businesses (hair salons, barbers, ...).
Customers book online; business owners manage services, staff and bookings.

## Tech stack

- React 19, TypeScript, Vite
- Tailwind CSS, shadcn/ui
- TanStack Query, React Router, react-hook-form + zod
- i18next (Turkish, English)

## Requirements

- Node.js (LTS)
- The backend (`fast-appointment-be`) running locally

## Setup

```bash
npm install
```

Create `.env.local`:

```
VITE_USE_FIXTURES=false
VITE_API_BASE_URL=http://localhost:8080
```

Set `VITE_USE_FIXTURES=true` to run without the backend, using in-memory sample data.

## Run

```bash
npm run dev
```

The app runs on http://localhost:5173.

## Scripts

| Command             | Description          |
| ------------------- | -------------------- |
| `npm run dev`       | Start the dev server |
| `npm run build`     | Production build     |
| `npm run typecheck` | Type check           |
| `npm run lint`      | Lint                 |
