import { randomUUID } from "crypto";
import { createSchema } from "graphql-yoga";
import { eventBus } from "./eventBus.js";
import { getDriverStandings, getRaceCalendar } from "./f1Api.js";
import type { Message } from "./types.js";

const messages: Message[] = [];

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

    type Message {
      id: ID!
      author: String!
      text: String!
      createdAt: String!
    }

    input MessageInput {
      author: String!
      text: String!
    }

    type Query {
      "Current Formula 1 driver standings."
      driverStandings: [DriverStanding!]!
      "A single driver by their Jolpica ID. Returns null if not found."
      driver(id: ID!): DriverStanding
      "Current season race calendar."
      raceCalendar: [Race!]!
      "All messages posted to the message board."
      messages: [Message!]!
    }

    type Mutation {
      "Post a new message. The server pushes it to all connected clients via SSE."
      addMessage(input: MessageInput!): Message!
    }
  `,
  resolvers: {
    Query: {
      driverStandings: () => getDriverStandings(),
      driver: async (_: unknown, { id }: { id: string }) => {
        const standings = await getDriverStandings();
        return standings.find((d) => d.id === id) ?? null;
      },
      raceCalendar: () => getRaceCalendar(),
      messages: () => messages
    },
    Mutation: {
      addMessage: (
        _: unknown,
        { input }: { input: { author: string; text: string } }
      ): Message => {
        const message: Message = {
          id: randomUUID(),
          author: input.author.trim(),
          text: input.text.trim(),
          createdAt: new Date().toISOString()
        };
        messages.push(message);
        eventBus.emit("message-added", message);
        return message;
      }
    }
  }
});
