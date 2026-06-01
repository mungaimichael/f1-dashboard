import { memo } from "react";
import type { ConnectionState, RaceEvent, RaceEventType } from "../types";

type Props = {
  events: RaceEvent[];
  connectionState: ConnectionState;
};

const eventLabels: Record<RaceEventType, string> = {
  OVERTAKE:    "Overtake",
  FASTEST_LAP: "Fastest lap",
  PIT_STOP:    "Pit stop",
  SAFETY_CAR:  "Safety car"
};

// Maps event type to a modifier class for distinct coloring
const eventTypeClass: Record<RaceEventType, string> = {
  OVERTAKE:    "event-type--overtake",
  FASTEST_LAP: "event-type--fastest_lap",
  PIT_STOP:    "event-type--pit_stop",
  SAFETY_CAR:  "event-type--safety_car"
};

const RaceEventItem = memo(function RaceEventItem({
  event
}: {
  event: RaceEvent;
}) {
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
  const isOpen = connectionState === "open";

  return (
    <section className="feed-section" aria-labelledby="feed-title">
      <div className="section-heading">
        <h2 id="feed-title">Race control</h2>
        <span className="connection" aria-label={`SSE connection: ${connectionState}`}>
          <span className={isOpen ? "dot dot-open" : "dot dot-closed"} aria-hidden="true" />
          <span>{connectionState}</span>
        </span>
      </div>

      {events.length === 0 ? (
        <div className="empty-feed" aria-live="polite">
          Waiting for race events
        </div>
      ) : (
        <ol className="event-list" aria-live="polite" aria-label="Live race events">
          {events.map((event) => (
            <RaceEventItem key={event.id} event={event} />
          ))}
        </ol>
      )}
    </section>
  );
}
