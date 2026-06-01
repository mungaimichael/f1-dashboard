import { useEffect, useRef, useState } from "react";
import type { RaceEvent } from "../types";

const TOAST_DURATION_MS = 4000;

export function useToast(events: RaceEvent[]) {
  const [toast, setToast] = useState<RaceEvent | null>(null);
  const prevLengthRef = useRef(0);

  // Fire a toast when a new SAFETY_CAR event arrives at the front of the list
  useEffect(() => {
    if (events.length > prevLengthRef.current) {
      const newest = events[0];
      if (newest?.type === "SAFETY_CAR") {
        setToast(newest);
      }
    }
    prevLengthRef.current = events.length;
  }, [events]);

  // Auto-dismiss after TOAST_DURATION_MS
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  return { toast, dismiss: () => setToast(null) };
}
