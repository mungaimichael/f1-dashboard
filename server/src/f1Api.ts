import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { DriverStanding } from "./types.js";

const JOLPICA_BASE_URL =
  process.env.JOLPICA_BASE_URL ?? "https://api.jolpi.ca/ergast/f1";

const FETCH_TIMEOUT_MS = 5000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.resolve(__dirname, "../../drivers.csv");

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
