import type { Request, Response } from "express";
import { getDriverStandings } from "./f1Api.js";
import type { DriverStanding, RaceEvent, RaceEventType } from "./types.js";

const clients = new Set<Response>();
const eventTypes: RaceEventType[] = [
  "OVERTAKE",
  "FASTEST_LAP",
  "PIT_STOP",
  "SAFETY_CAR"
];

let cachedDrivers: DriverStanding[] = [];
let currentLap = 1;

const fallbackDrivers: DriverStanding[] = [
  {
    id: "verstappen",
    position: 1,
    code: "VER",
    name: "Max Verstappen",
    givenName: "Max",
    familyName: "Verstappen",
    nationality: "Dutch",
    team: "Red Bull",
    constructorId: "red_bull",
    points: 0,
    wins: 0
  },
  {
    id: "leclerc",
    position: 2,
    code: "LEC",
    name: "Charles Leclerc",
    givenName: "Charles",
    familyName: "Leclerc",
    nationality: "Monegasque",
    team: "Ferrari",
    constructorId: "ferrari",
    points: 0,
    wins: 0
  },
  {
    id: "norris",
    position: 3,
    code: "NOR",
    name: "Lando Norris",
    givenName: "Lando",
    familyName: "Norris",
    nationality: "British",
    team: "McLaren",
    constructorId: "mclaren",
    points: 0,
    wins: 0
  }
];

function writeEvent(response: Response, event: RaceEvent): void {
  response.write(`id: ${event.id}\n`);
  response.write("event: race-event\n");
  response.write(`data: ${JSON.stringify(event)}\n\n`);
}

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function createRaceEvent(drivers: DriverStanding[]): RaceEvent {
  const type = randomItem(eventTypes);
  const driver = randomItem(drivers);
  const lap = currentLap;
  const position = Math.max(
    1,
    Math.min(20, driver.position + Math.floor(Math.random() * 5) - 2)
  );

  currentLap = currentLap >= 58 ? 1 : currentLap + 1;

  const shortName = driver.familyName;
  const messages: Record<RaceEventType, string> = {
    OVERTAKE: `${shortName} moves up to P${position}`,
    FASTEST_LAP: `${shortName} sets the fastest lap`,
    PIT_STOP: `${shortName} pits from P${position}`,
    SAFETY_CAR: `Safety car deployed after an incident involving ${shortName}`
  };

  return {
    id: `race-event-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    driver: shortName,
    lap,
    position,
    message: messages[type],
    occurredAt: new Date().toISOString()
  };
}

async function loadDrivers(): Promise<DriverStanding[]> {
  if (cachedDrivers.length > 0) {
    return cachedDrivers;
  }

  try {
    cachedDrivers = await getDriverStandings();
  } catch (error) {
    console.warn("Using fallback drivers for SSE simulation", error);
    cachedDrivers = fallbackDrivers;
  }

  return cachedDrivers;
}

export function eventsHandler(request: Request, response: Response): void {
  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Cache-Control", "no-cache, no-transform");
  response.setHeader("Connection", "keep-alive");
  response.flushHeaders();

  clients.add(response);
  response.write(": connected\n\n");

  request.on("close", () => {
    clients.delete(response);
  });
}

export function startRaceEventSimulator(): void {
  setInterval(async () => {
    if (clients.size === 0) {
      return;
    }

    try {
      const drivers = await loadDrivers();
      const event = createRaceEvent(drivers);

      for (const client of clients) {
        writeEvent(client, event);
      }
    } catch (error) {
      console.error("Failed to generate race event", error);
    }
  }, 3500);
}
