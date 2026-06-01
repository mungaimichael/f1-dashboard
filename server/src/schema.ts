import { createSchema } from "graphql-yoga";
import { getDriverStandings } from "./f1Api.js";

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

    type Query {
      "Current Formula 1 driver standings."
      driverStandings: [DriverStanding!]!
      "A single driver by their Jolpica ID. Returns null if not found."
      driver(id: ID!): DriverStanding
    }
  `,
  resolvers: {
    Query: {
      driverStandings: () => getDriverStandings(),
      driver: async (_: unknown, { id }: { id: string }) => {
        const standings = await getDriverStandings();
        return standings.find((d) => d.id === id) ?? null;
      }
    }
  }
});
