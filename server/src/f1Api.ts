import type { DriverStanding } from "./types.js";

const JOLPICA_BASE_URL =
  process.env.JOLPICA_BASE_URL ?? "https://api.jolpi.ca/ergast/f1";

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

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${JOLPICA_BASE_URL}${path}`, {
    headers: {
      accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Jolpica request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getDriverStandings(): Promise<DriverStanding[]> {
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
}
