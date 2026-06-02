export type DriverStanding = {
  id: string;
  position: number;
  code: string | null;
  name: string;
  team: string;
  points: number;
  wins: number;
};

export type DriverStandingsData = {
  driverStandings: DriverStanding[];
};

export type RaceEventType =
  | "OVERTAKE"
  | "FASTEST_LAP"
  | "PIT_STOP"
  | "SAFETY_CAR";

export type RaceEvent = {
  id: string;
  type: RaceEventType;
  driver: string;
  lap: number;
  position?: number;
  message: string;
  occurredAt: string;
};

export type ConnectionState = "connecting" | "open" | "closed" | "error";

export type Message = {
  id: string;
  author: string;
  text: string;
  createdAt: string;
};
