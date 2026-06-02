import { useEffect, useState } from "react";
import { EVENTS_URL } from "../config";
import type { ConnectionState, RaceEvent } from "../types";

const MAX_EVENTS = 24;

export function useRaceEvents(url = EVENTS_URL) {
  const [events, setEvents] = useState<RaceEvent[]>([]);
  const [totalReceived, setTotalReceived] = useState(0);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("connecting");

  useEffect(() => {
    const source = new EventSource(url);

    source.addEventListener("open", () => {
      setConnectionState("open");
    });

    source.addEventListener("race-event", (event) => {
      const payload = JSON.parse(event.data) as RaceEvent;

      setTotalReceived((n) => n + 1);
      setEvents((currentEvents) => [
        payload,
        ...currentEvents.slice(0, MAX_EVENTS - 1)
      ]);
    });

    source.addEventListener("error", () => {
      setConnectionState("error");
    });

    return () => {
      setConnectionState("closed");
      source.close();
    };
  }, [url]);

  return {
    events,
    totalReceived,
    connectionState
  };
}
