import { useQuery } from "@apollo/client/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DriverModal } from "./components/DriverModal";
import { DriverStandingsTable } from "./components/DriverStandingsTable";
import { LiveEventFeed } from "./components/LiveEventFeed";
import { MessageBoard } from "./components/MessageBoard";
import { NextRaceCountdown } from "./components/NextRaceCountdown";
import { RaceCalendar } from "./components/RaceCalendar";
import { Toast } from "./components/Toast";
import { LoadingIcon } from "./components/LoadingIcon";
import { GET_DRIVER_STANDINGS, GET_RACE_CALENDAR } from "./graphql/queries";
import { useRaceEvents } from "./hooks/useRaceEvents";
import { useToast } from "./hooks/useToast";
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
  const { events, totalReceived, connectionState, currentLap, totalLaps, reconnectAttempt } =
    useRaceEvents();
  const { toast, dismiss } = useToast(events);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("f1-theme") as "light" | "dark") || 
          (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")
  );

  useEffect(() => {
    document.documentElement.classList.add('theme-transition');
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('f1-theme', theme);

    const timeout = setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 800);

    return () => clearTimeout(timeout);
  }, [theme]);

  const graphqlStatus = error ? "Error" : "Ready";
  const sseLabel =
    connectionState === "reconnecting"
      ? `Reconnecting (${reconnectAttempt})`
      : connectionState;

  const now = new Date().toISOString().slice(0, 10);
  const nextRace = calendarData?.raceCalendar.find((r) => r.date >= now) ?? null;

  return (
    <main className="app-shell">
      <header className="masthead">
        <div>
          <p>F1 Telemetry</p>
          <h1>Live standings &amp; race events</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
            aria-label="Toggle theme"
          >
            <span className="theme-icon"></span>
            <motion.div 
              className="theme-toggle-knob"
              animate={{ x: theme === 'light' ? 28 : 0 }}
              transition={{ type: "spring", stiffness: 600, damping: 30 }}
            />
          </button>
          <button
            type="button"
            id="refresh-standings-btn"
            onClick={() => void refetch()}
          >
            Refresh
          </button>
        </div>
      </header>

      <section className="status-strip" aria-label="Connection status">
        <div>
          <span>GraphQL</span>
          <strong>{loading ? <LoadingIcon /> : graphqlStatus}</strong>
        </div>
        <div>
          <span>SSE stream</span>
          <strong data-reconnecting={connectionState === "reconnecting"}>{sseLabel}</strong>
        </div>
        <div>
          <span>Events</span>
          <strong>{totalReceived}</strong>
        </div>
        <div>
          <span>Lap</span>
          <strong>{currentLap} / {totalLaps}</strong>
          <div
            className="lap-progress"
            role="progressbar"
            aria-valuenow={currentLap}
            aria-valuemin={1}
            aria-valuemax={totalLaps}
            aria-label={`Lap ${currentLap} of ${totalLaps}`}
          >
            <div
              className="lap-progress-fill"
              style={{ width: `${(currentLap / totalLaps) * 100}%` }}
            />
          </div>
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
          onSelectDriver={setSelectedDriverId}
        />
        <LiveEventFeed events={events} connectionState={connectionState} />
      </div>

      <RaceCalendar
        races={calendarData?.raceCalendar ?? []}
        loading={calendarLoading && !calendarData}
      />

      <MessageBoard />

      {toast ? <Toast event={toast} onDismiss={dismiss} /> : null}

      {selectedDriverId ? (
        <DriverModal
          driverId={selectedDriverId}
          onClose={() => setSelectedDriverId(null)}
        />
      ) : null}
    </main>
  );
}
