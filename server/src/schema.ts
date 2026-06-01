import { createSchema } from "graphql-yoga";
import { getDriverStandings, getRaceCalendar } from "./f1Api.js";

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    """
    A current Formula 1 driver standing from Jolpica.
    """
    type DriverStanding {
      "Stable Jolpica driver identifier."
      id: ID!
      "Current championship position."
      position: Int!
      "Three-letter driver code when available."
      code: String
      "Full driver name."
      name: String!
      "Driver given name."
      givenName: String!
      "Driver family name."
      familyName: String!
      "Driver nationality."
      nationality: String!
      "Current constructor name."
      team: String!
      "Stable Jolpica constructor identifier."
      constructorId: ID!
      "Current championship points."
      points: Float!
      "Current season wins."
      wins: Int!
    }

    type Session {
      name: String!
      date: String!
      time: String
    }

    type Race {
      round: Int!
      season: String!
      raceName: String!
      circuitId: ID!
      circuitName: String!
      locality: String!
      country: String!
      lat: Float
      lng: Float
      date: String!
      time: String
      isSprint: Boolean!
      sessions: [Session!]!
    }

    type Query {
      "Current Formula 1 driver standings."
      driverStandings: [DriverStanding!]!
      "Current season race calendar."
      raceCalendar: [Race!]!
    }
  `,
  resolvers: {
    Query: {
      driverStandings: () => getDriverStandings(),
      raceCalendar: () => getRaceCalendar()
    }
  }
});
