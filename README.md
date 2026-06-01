# F1 GraphQL + SSE Demo

Small demo for showing GraphQL consumption and server-sent events with Formula 1 data.

## Architecture

```txt
web/
  Vite React
  Apollo Client
  Browser EventSource SSE client

server/
  Express server
  GraphQL Yoga at /graphql
  SSE stream at /events
  Jolpica F1 API adapter
```

## Run Locally

Install dependencies:

```bash
npm install
```

Start the backend:

```bash
npm run dev:server
```

Start the web app:

```bash
npm run dev:web
```

The server defaults to `http://localhost:4000`.
The web app defaults to `http://localhost:5174`.

## Demo Queries

```graphql
query GetDriverStandings {
  driverStandings {
    id
    position
    code
    name
    team
    points
    wins
  }
}
```

SSE emits messages like:

```json
{
  "id": "race-event-1717171717-abc12",
  "type": "PIT_STOP",
  "driver": "Leclerc",
  "lap": 23,
  "message": "Leclerc pits from P3"
}
```
