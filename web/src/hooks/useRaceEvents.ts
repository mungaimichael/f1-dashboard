import { useEffect, useRef, useState } from "react";
import { EVENTS_URL } from "../config";
import type { ConnectionState, RaceEvent } from "../types";

const MAX_EVENTS = 24;
export const TOTAL_LAPS = 58;

export function useRaceEvents(url = EVENTS_URL) {
  const [events, setEvents] = useState<RaceEvent[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const [currentLap, setCurrentLap] = useState(1);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  const sourceRef = useRef<EventSource | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptRef = useRef(0);

  useEffect(() => {
    function connect() {
      const source = new EventSource(url);
      sourceRef.current = source;

      source.addEventListener("open", () => {
        attemptRef.current = 0;
        setReconnectAttempt(0);
        setConnectionState("open");
      });

      source.addEventListener("race-event", (e: MessageEvent) => {
        const payload = JSON.parse(e.data as string) as RaceEvent;
        setCurrentLap(payload.lap);
        setEvents((prev) => [payload, ...prev.slice(0, MAX_EVENTS - 1)]);
      });

      source.addEventListener("error", () => {
        source.close();
        sourceRef.current = null;

        // Exponential backoff: 1s, 2s, 4s, 8s … capped at 30s
        const attempt = attemptRef.current;
        const delay = Math.min(1000 * 2 ** attempt, 30_000);
        attemptRef.current = attempt + 1;
        setReconnectAttempt(attempt + 1);
        setConnectionState("reconnecting");

        retryTimerRef.current = setTimeout(connect, delay);
      });
    }

    connect();

    return () => {
      if (retryTimerRef.current !== null) clearTimeout(retryTimerRef.current);
      sourceRef.current?.close();
      setConnectionState("closed");
    };
  }, [url]);

  return { events, connectionState, currentLap, reconnectAttempt, totalLaps: TOTAL_LAPS };
}
