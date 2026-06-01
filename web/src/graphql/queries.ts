import { gql } from "@apollo/client";

export const GET_DRIVER_STANDINGS = gql`
  query GetDriverStandings {
    driverStandings {
      id
      position
      code
      name
      team
      points
      wins
    }
  }
`;

export const GET_RACE_CALENDAR = gql`
  query GetRaceCalendar {
    raceCalendar {
      round
      season
      raceName
      circuitId
      circuitName
      locality
      country
      date
      time
      isSprint
      sessions {
        name
        date
        time
      }
    }
  }
`;
