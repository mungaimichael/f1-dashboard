export type DriverStanding = {
  id: string;
  position: number;
  code: string | null;
  name: string;
  givenName: string;
  familyName: string;
  nationality: string;
  team: string;
  constructorId: string;
  points: number;
  wins: number;
};

export type Message = {
  id: string;
  author: string;
  text: string;
  createdAt: string;
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
