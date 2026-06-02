import { useQuery } from "@apollo/client/react";
import { DriverStandingsTable } from "./components/DriverStandingsTable";
import { LiveEventFeed } from "./components/LiveEventFeed";
import { MessageBoard } from "./components/MessageBoard";
import { NextRaceCountdown } from "./components/NextRaceCountdown";
import { RaceCalendar } from "./components/RaceCalendar";
import { GET_DRIVER_STANDINGS, GET_RACE_CALENDAR } from "./graphql/queries";
import { useRaceEvents } from "./hooks/useRaceEvents";
import type { DriverStandingsData, RaceCalendarData } from "./types";

export function App() {
  const { data, loading, error, refetch } = useQuery<DriverStandingsData>(
    GET_DRIVER_STANDINGS,
    { fetchPolicy: "cache-and-network" }
  );
  const { data: calendarData, loading: calendarLoading } =
    useQuery<RaceCalendarData>(GET_RACE_CALENDAR, {
      fetchPolicy: "cache-and-network"
    });
  const { events, totalReceived, connectionState } = useRaceEvents();

  const graphqlStatus = loading ? "Loading…" : error ? "Error" : "Ready";

  const now = new Date().toISOString().slice(0, 10);
  const nextRace = calendarData?.raceCalendar.find((r) => r.date >= now) ?? null;

  return (
    <main className="app-shell">
      <header className="masthead">
        <div>
          <p className="eyebrow">F1 Telemetry</p>
          <h1>Live standings &amp; race events</h1>
        </div>
        <button
          type="button"
          id="refresh-standings-btn"
          onClick={() => void refetch()}
        >
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
          <strong>{totalReceived}</strong>
        </div>
      </section>

      <NextRaceCountdown
        race={nextRace}
        loading={calendarLoading && !calendarData}
      />

      {error ? (
        <section className="error-panel" role="alert">
          <strong>Could not load driver standings.</strong>
          <span>{error.message}</span>
        </section>
      ) : null}

      <div className="dashboard-grid">
        <DriverStandingsTable
          standings={data?.driverStandings ?? []}
          loading={loading && !data}
        />
        <LiveEventFeed events={events} connectionState={connectionState} />
      </div>

      <RaceCalendar
        races={calendarData?.raceCalendar ?? []}
        loading={calendarLoading && !calendarData}
      />

      <MessageBoard />
    </main>
  );
}
