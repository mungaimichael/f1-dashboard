import type { DriverStanding, Race, Session } from "./types.js";

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

export async function getRaceCalendar(): Promise<Race[]> {
  const data = await fetchJson<RacesResponse>("/current/races.json");

  const races = data.MRData.RaceTable.Races;

  return races.map((race) => {
    const loc = race.Circuit.Location;
    const lat = loc.lat ? Number(loc.lat) : null;
    const lng = loc.long ? Number(loc.long) : null;

    const sessions: Session[] = [];

    if (race.FirstPractice) {
      sessions.push({
        name: "Practice 1",
        date: race.FirstPractice.date,
        time: race.FirstPractice.time ?? null
      });
    }
    if (race.SecondPractice) {
      sessions.push({
        name: "Practice 2",
        date: race.SecondPractice.date,
        time: race.SecondPractice.time ?? null
      });
    }
    if (race.ThirdPractice) {
      sessions.push({
        name: "Practice 3",
        date: race.ThirdPractice.date,
        time: race.ThirdPractice.time ?? null
      });
    }
    if (race.Qualifying) {
      sessions.push({
        name: "Qualifying",
        date: race.Qualifying.date,
        time: race.Qualifying.time ?? null
      });
    }
    if (race.Sprint) {
      sessions.push({
        name: "Sprint",
        date: race.Sprint.date,
        time: race.Sprint.time ?? null
      });
    }

    sessions.push({
      name: "Race",
      date: race.date,
      time: race.time ?? null
    });

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
}
