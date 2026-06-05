import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ConnectionState, RaceEvent, RaceEventType } from "../types";

type Props = {
  events: RaceEvent[];
  connectionState: ConnectionState;
};

const ALL_TYPES: RaceEventType[] = ["OVERTAKE", "FASTEST_LAP", "PIT_STOP", "SAFETY_CAR"];

const eventLabels: Record<RaceEventType, string> = {
  OVERTAKE: "Overtake",
  FASTEST_LAP: "Fastest lap",
  PIT_STOP: "Pit stop",
  SAFETY_CAR: "Safety car"
};

const eventTypeClass: Record<RaceEventType, string> = {
  OVERTAKE: "event-type--overtake",
  FASTEST_LAP: "event-type--fastest_lap",
  PIT_STOP: "event-type--pit_stop",
  SAFETY_CAR: "event-type--safety_car"
};

const RaceEventItem = memo(function RaceEventItem({ event, index, isCollapsed }: { event: RaceEvent, index: number, isCollapsed: boolean }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={
        isCollapsed
          ? {
            opacity: index > 2 ? 0 : 1 - index * 0.15,
            scale: index > 2 ? 0.85 : 1 - index * 0.05,
            marginTop: index > 0 ? -50 : 0,
            zIndex: 100 - index,
            filter: `blur(${index > 2 ? 8 : index * 1.5}px)`,
            transitionEnd: {
              display: index > 2 ? "none" : "flex",
            },
          }
          : {
            display: "flex",
            opacity: Math.max(0.6, 1 - index * 0.05),
            scale: 1,
            marginTop: 0,
            zIndex: 100 - index,
            filter: "blur(0px)",
          }
      }
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="event-item"
      style={{ position: "relative" }}
    >
      <div>
        <span className={`event-type ${eventTypeClass[event.type]}`}>
          {eventLabels[event.type]}
        </span>
        <strong>{event.message}</strong>
      </div>
      <span className="lap">Lap {event.lap}</span>
    </motion.li>
  );
});

export function LiveEventFeed({ events, connectionState }: Props) {
  const [activeFilters, setActiveFilters] = useState<Set<RaceEventType>>(
    new Set(ALL_TYPES)
  );
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isOpen = connectionState === "open";

  function toggleFilter(type: RaceEventType) {
    setActiveFilters((prev) => {
      if (prev.size === 1 && prev.has(type)) return prev;
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
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            type="button"
            className="filter-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{ padding: '4px 10px', fontSize: '0.65rem', border: '1px solid var(--border)' }}
          >
            {isCollapsed ? "Expand Events" : "Collapse"}
          </button>
          <span className="connection" aria-label={`SSE connection: ${connectionState}`}>
            <span className={isOpen ? "dot dot-open" : "dot dot-closed"} aria-hidden="true" />
            <span>{connectionState}</span>
          </span>
        </div>
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
        <ol
          className="event-list"
          aria-live="polite"
          aria-label="Live race events"
          onClick={() => isCollapsed && setIsCollapsed(false)}
          style={{ cursor: isCollapsed ? 'pointer' : 'default' }}
        >
          <AnimatePresence mode="popLayout">
            {visibleEvents.map((event, index) => (
              <RaceEventItem key={event.id} event={event} index={index} isCollapsed={isCollapsed} />
            ))}
          </AnimatePresence>
        </ol>
      )}
    </section>
  );
}
