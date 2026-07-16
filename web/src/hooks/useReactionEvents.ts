import { useEffect, useState } from "react";
import { EVENTS_URL } from "../config";
import type { ConnectionState, Reaction } from "../types";

export function useReactionEvents() {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("connecting");

  useEffect(() => {
    const source = new EventSource(EVENTS_URL);

    source.addEventListener("open", () => {
      setConnectionState("open");
    });

    source.addEventListener("reaction-added", (e) => {
      const reaction = JSON.parse((e as MessageEvent).data) as Reaction;
      setReactions((prev) => [...prev, reaction]);
    });

    source.addEventListener("error", () => {
      setConnectionState("error");
    });

    return () => {
      setConnectionState("closed");
      source.close();
    };
  }, []);

  return { reactions, connectionState };
}
