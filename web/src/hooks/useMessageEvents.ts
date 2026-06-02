import { useEffect, useState } from "react";
import { EVENTS_URL } from "../config";
import type { ConnectionState, Message } from "../types";

export function useMessageEvents() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("connecting");

  useEffect(() => {
    const source = new EventSource(EVENTS_URL);

    source.addEventListener("open", () => {
      setConnectionState("open");
    });

    source.addEventListener("message-added", (e) => {
      const msg = JSON.parse((e as MessageEvent).data) as Message;
      setMessages((prev) => [...prev, msg]);
    });

    source.addEventListener("error", () => {
      setConnectionState("error");
    });

    return () => {
      setConnectionState("closed");
      source.close();
    };
  }, []);

  return { messages, connectionState };
}
