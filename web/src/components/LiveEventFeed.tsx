import { memo, useState } from "react";
import type { ConnectionState, RaceEvent, RaceEventType } from "../types";

type Props = {
  events: RaceEvent[];
  connectionState: ConnectionState;
};

const ALL_TYPES: RaceEventType[] = ["OVERTAKE", "FASTEST_LAP", "PIT_STOP", "SAFETY_CAR"];

const eventLabels: Record<RaceEventType, string> = {
  OVERTAKE:    "Overtake",
  FASTEST_LAP: "Fastest lap",
  PIT_STOP:    "Pit stop",
  SAFETY_CAR:  "Safety car"
};

const eventTypeClass: Record<RaceEventType, string> = {
  OVERTAKE:    "event-type--overtake",
  FASTEST_LAP: "event-type--fastest_lap",
  PIT_STOP:    "event-type--pit_stop",
  SAFETY_CAR:  "event-type--safety_car"
};

const RaceEventItem = memo(function RaceEventItem({ event }: { event: RaceEvent }) {
  return (
    <li className="event-item">
      <div>
        <span className={`event-type ${eventTypeClass[event.type]}`}>
          {eventLabels[event.type]}
        </span>
        <strong>{event.message}</strong>
      </div>
      <span className="lap">Lap {event.lap}</span>
    </li>
  );
});

export function LiveEventFeed({ events, connectionState }: Props) {
  const [activeFilters, setActiveFilters] = useState<Set<RaceEventType>>(
    new Set(ALL_TYPES)
  );

  const isOpen = connectionState === "open";

  function toggleFilter(type: RaceEventType) {
    setActiveFilters((prev) => {
      // Keep at least one filter active
      if (prev.has(type) && prev.size === 1) return prev;
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  }

  const visibleEvents = events.filter((e) => activeFilters.has(e.type));

  return (
    <section className="feed-section" aria-labelledby="feed-title">
      <div className="section-heading">
        <h2 id="feed-title">Race control</h2>
        <span className="connection" aria-label={`SSE connection: ${connectionState}`}>
          <span className={isOpen ? "dot dot-open" : "dot dot-closed"} aria-hidden="true" />
          <span>{connectionState}</span>
        </span>
      </div>

      <div className="filter-bar" role="group" aria-label="Filter by event type">
        {ALL_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            className="filter-btn"
            aria-pressed={activeFilters.has(type)}
            onClick={() => toggleFilter(type)}
          >
            {eventLabels[type]}
          </button>
        ))}
      </div>

      {visibleEvents.length === 0 ? (
        <div className="empty-feed" aria-live="polite">
          {events.length === 0 ? "Waiting for race events" : "No events match the filter"}
        </div>
      ) : (
        <ol className="event-list" aria-live="polite" aria-label="Live race events">
          {visibleEvents.map((event) => (
            <RaceEventItem key={event.id} event={event} />
          ))}
        </ol>
      )}
    </section>
  );
}
