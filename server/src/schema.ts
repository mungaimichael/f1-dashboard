import { randomUUID } from "crypto";
import { createSchema } from "graphql-yoga";
import { eventBus } from "./eventBus.js";
import { getDriverStandings } from "./f1Api.js";
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
