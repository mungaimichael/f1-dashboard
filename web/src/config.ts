// On Android (emulator or USB device), localhost is reachable via
// `adb reverse tcp:4000 tcp:4000`, which forwards it to the dev machine.
const DEFAULT_HOST = "http://localhost:4000";

export const GRAPHQL_URL =
  import.meta.env.VITE_GRAPHQL_URL ?? `${DEFAULT_HOST}/graphql`;

export const EVENTS_URL =
  import.meta.env.VITE_EVENTS_URL ?? `${DEFAULT_HOST}/events`;
