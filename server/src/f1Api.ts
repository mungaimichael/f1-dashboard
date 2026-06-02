import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { DriverStanding, Race, Session } from "./types.js";

const JOLPICA_BASE_URL =
  process.env.JOLPICA_BASE_URL ?? "https://api.jolpi.ca/ergast/f1";

const FETCH_TIMEOUT_MS = 5000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.resolve(__dirname, "../../drivers.csv");
const RACES_CSV_PATH = path.resolve(__dirname, "../../races.csv");

type JolpicaDriverStanding = {
  position: string;
  points: string;
  wins: string;
  Driver: {
    driverId: string;
    code?: string;
    givenName: string;
    familyName: string;
    nationality: string;
  };
  Constructors: Array<{
    constructorId: string;
    name: string;
  }>;
};

type DriverStandingsResponse = {
  MRData: {
    StandingsTable: {
      StandingsLists: Array<{
        DriverStandings: JolpicaDriverStanding[];
      }>;
    };
  };
};

type JolpicaLocation = {
  lat: string;
  long: string;
  locality: string;
  country: string;
};

type JolpicaCircuit = {
  circuitId: string;
  url: string;
  circuitName: string;
  Location: JolpicaLocation;
};

type JolpicaSession = {
  date: string;
  time: string;
};

type JolpicaRace = {
  season: string;
  round: string;
  url: string;
  raceName: string;
  date: string;
  time?: string;
  Circuit: JolpicaCircuit;
  FirstPractice?: JolpicaSession;
  SecondPractice?: JolpicaSession;
  ThirdPractice?: JolpicaSession;
  Qualifying?: JolpicaSession;
  Sprint?: JolpicaSession;
};

type RacesResponse = {
  MRData: {
    RaceTable: {
      season: string;
      Races: JolpicaRace[];
    };
  };
};

async function fetchJson<T>(urlPath: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${JOLPICA_BASE_URL}${urlPath}`, {
      headers: { accept: "application/json" },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Jolpica request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  } finally {
    clearTimeout(timer);
  }
}

function loadDriversFromCsv(): DriverStanding[] {
  const text = readFileSync(CSV_PATH, "utf-8");
  const [, ...rows] = text.trim().split("\n");

  return rows.map((line) => {
    const [id, position, code, name, team, points, wins] = line.split(",");
    const spaceIndex = name.indexOf(" ");
    const givenName = spaceIndex === -1 ? name : name.slice(0, spaceIndex);
    const familyName = spaceIndex === -1 ? "" : name.slice(spaceIndex + 1);

    return {
      id,
      position: Number(position),
      code: code || null,
      name,
      givenName,
      familyName,
      nationality: "Unknown",
      team,
      constructorId: team.toLowerCase().replace(/\s+/g, "_"),
      points: Number(points),
      wins: Number(wins)
    };
  });
}

export async function getDriverStandings(): Promise<DriverStanding[]> {
  try {
    const data = await fetchJson<DriverStandingsResponse>(
      "/current/driverStandings.json"
    );

    const standings =
      data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings ?? [];

    return standings.map((standing) => {
      const constructor = standing.Constructors[0];
      const driver = standing.Driver;

      return {
        id: driver.driverId,
        position: Number(standing.position),
        code: driver.code ?? null,
        name: `${driver.givenName} ${driver.familyName}`,
        givenName: driver.givenName,
        familyName: driver.familyName,
        nationality: driver.nationality,
        team: constructor?.name ?? "Unknown team",
        constructorId: constructor?.constructorId ?? "unknown",
        points: Number(standing.points),
        wins: Number(standing.wins)
      };
    });
  } catch (error) {
    console.warn("Jolpica API unavailable, falling back to CSV data:", error);
    return loadDriversFromCsv();
  }
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let i = 0;

  while (i < line.length) {
    if (line[i] === '"') {
      i++;
      let field = "";
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') {
          field += '"';
          i += 2;
        } else if (line[i] === '"') {
          i++;
          break;
        } else {
          field += line[i++];
        }
      }
      if (i < line.length && line[i] === ",") i++;
      fields.push(field);
    } else {
      const end = line.indexOf(",", i);
      if (end === -1) {
        fields.push(line.slice(i));
        break;
      }
      fields.push(line.slice(i, end));
      i = end + 1;
    }
  }

  return fields;
}

function loadRacesFromCsv(): Race[] {
  const text = readFileSync(RACES_CSV_PATH, "utf-8");
  const [, ...rows] = text.trim().split("\n");

  return rows.map((line) => {
    const [
      round, season, raceName, circuitId, circuitName,
      locality, country, lat, lng, date, time, isSprint, sessions
    ] = parseCsvLine(line);

    return {
      round: Number(round),
      season,
      raceName,
      circuitId,
      circuitName,
      locality,
      country,
      lat: lat ? Number(lat) : null,
      lng: lng ? Number(lng) : null,
      date,
      time: time || null,
      isSprint: isSprint === "true",
      sessions: JSON.parse(sessions) as Session[]
    };
  });
}

export async function getRaceCalendar(): Promise<Race[]> {
  try {
    const data = await fetchJson<RacesResponse>("/current/races.json");

    const races = data.MRData.RaceTable.Races;

    return races.map((race) => {
      const loc = race.Circuit.Location;
      const lat = loc.lat ? Number(loc.lat) : null;
      const lng = loc.long ? Number(loc.long) : null;

      const sessions: Session[] = [];

      if (race.FirstPractice) {
        sessions.push({ name: "Practice 1", date: race.FirstPractice.date, time: race.FirstPractice.time ?? null });
      }
      if (race.SecondPractice) {
        sessions.push({ name: "Practice 2", date: race.SecondPractice.date, time: race.SecondPractice.time ?? null });
      }
      if (race.ThirdPractice) {
        sessions.push({ name: "Practice 3", date: race.ThirdPractice.date, time: race.ThirdPractice.time ?? null });
      }
      if (race.Qualifying) {
        sessions.push({ name: "Qualifying", date: race.Qualifying.date, time: race.Qualifying.time ?? null });
      }
      if (race.Sprint) {
        sessions.push({ name: "Sprint", date: race.Sprint.date, time: race.Sprint.time ?? null });
      }

      sessions.push({ name: "Race", date: race.date, time: race.time ?? null });

      return {
        round: Number(race.round),
        season: race.season,
        raceName: race.raceName,
        circuitId: race.Circuit.circuitId,
        circuitName: race.Circuit.circuitName,
        locality: loc.locality,
        country: loc.country,
        lat,
        lng,
        date: race.date,
        time: race.time ?? null,
        isSprint: race.Sprint !== undefined,
        sessions
      };
    });
  } catch (error) {
    console.warn("Jolpica API unavailable, falling back to CSV race data:", error);
    return loadRacesFromCsv();
  }
}
