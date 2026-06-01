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

export type Session = {
  name: string;
  date: string;
  time: string | null;
};

export type Race = {
  round: number;
  season: string;
  raceName: string;
  circuitId: string;
  circuitName: string;
  locality: string;
  country: string;
  lat: number | null;
  lng: number | null;
  date: string;
  time: string | null;
  isSprint: boolean;
  sessions: Session[];
};

export type RaceCalendarData = {
  raceCalendar: Race[];
};
