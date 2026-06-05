import { useEffect, useRef, useState } from "react";
import type { RaceEvent } from "../types";

const TOAST_DURATION_MS = 4000;

export function useToast(events: RaceEvent[]) {
  const [toast, setToast] = useState<RaceEvent | null>(null);
  const prevLengthRef = useRef(0);

  useEffect(() => {
    if (events.length > prevLengthRef.current) {
      const newest = events[0];
      if (newest?.type === "SAFETY_CAR") {
        setToast(newest);
      }
    }
    prevLengthRef.current = events.length;
  }, [events]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  return { toast, dismiss: () => setToast(null) };
}
