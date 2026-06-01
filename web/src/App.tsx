import { useQuery } from "@apollo/client/react";
import { DriverStandingsTable } from "./components/DriverStandingsTable";
import { LiveEventFeed } from "./components/LiveEventFeed";
import { GET_DRIVER_STANDINGS } from "./graphql/queries";
import { useRaceEvents } from "./hooks/useRaceEvents";
import type { DriverStandingsData } from "./types";

export function App() {
  const { data, loading, error, refetch } = useQuery<DriverStandingsData>(
    GET_DRIVER_STANDINGS,
    {
      fetchPolicy: "cache-and-network"
    }
  );
  const { events, connectionState } = useRaceEvents();

  const graphqlStatus = loading ? "Loading…" : error ? "Error" : "Ready";

  return (
    <main className="app-shell">
      <header className="masthead">
        <div>
          <p className="eyebrow">F1 Telemetry</p>
          <h1>Live standings &amp; race events</h1>
        </div>
        <button type="button" id="refresh-standings-btn" onClick={() => void refetch()}>
          ↺ Refresh
        </button>
      </header>

      <section className="status-strip" aria-label="Connection status">
        <div>
          <span>GraphQL</span>
          <strong>{graphqlStatus}</strong>
        </div>
        <div>
          <span>SSE stream</span>
          <strong>{connectionState}</strong>
        </div>
        <div>
          <span>Events</span>
          <strong>{events.length}</strong>
        </div>
      </section>

      {error ? (
        <section className="error-panel" role="alert">
          <strong>Could not load driver standings.</strong>
          <span>{error.message}</span>
        </section>
      ) : null}

      <div className="dashboard-grid">
        <DriverStandingsTable standings={data?.driverStandings ?? []} loading={loading && !data} />
        <LiveEventFeed events={events} connectionState={connectionState} />
      </div>
    </main>
  );
}
