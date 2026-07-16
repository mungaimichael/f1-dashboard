import { randomUUID } from "crypto";
import { createSchema } from "graphql-yoga";
import { eventBus } from "./eventBus.js";
import { getDriverStandings, getRaceCalendar } from "./f1Api.js";
import type { Message, Reaction } from "./types.js";

const messages: Message[] = [];
const reactions: Reaction[] = [];

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

    """
    A fan's reaction photo, taken or picked via the native camera, after a race.
    """
    type Reaction {
      id: ID!
      author: String!
      "Photo encoded as a data URL (base64)."
      photoDataUrl: String!
      createdAt: String!
    }

    input ReactionInput {
      author: String!
      photoDataUrl: String!
    }

    type Group {
      id: String!
      label: String!
      roles: [String!]!
      pages: [String!]!
      actions: [String!]!
    }

    type UIPermissions {
      groups: [Group!]!
    }

    type Viewer {
      actorId: String!
      contextId: String!
      roles: [String!]!
      userType: String!
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
      "All race-reaction photos posted so far."
      reactions: [Reaction!]!

      viewer: Viewer!
      uiPermissions: UIPermissions!
    }

    type Mutation {
      "Post a new message. The server pushes it to all connected clients via SSE."
      addMessage(input: MessageInput!): Message!
      "Post a race-reaction photo. The server pushes it to all connected clients via SSE."
      addReaction(input: ReactionInput!): Reaction!
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
      messages: () => messages,
      reactions: () => reactions,
      viewer: (_: unknown, __: unknown, context: any) => {
        const rolesHeader = context.request?.headers.get("x-mock-roles");
        const roles = rolesHeader ? rolesHeader.split(",") : ["f1.admin"];
        return {
          actorId: "mock-user-1",
          contextId: "global",
          roles,
          userType: "user"
        };
      },
      uiPermissions: () => {
        return {
          groups: [
            {
              id: "admin-group",
              label: "Admin",
              roles: ["f1.admin"],
              pages: ["message_board", "calendar", "live_feed", "standings", "reactions"],
              actions: ["refresh_standings", "toggle_theme", "view_driver"]
            },
            {
              id: "fan-group",
              label: "Fan",
              roles: ["f1.fan"],
              pages: ["calendar", "standings", "live_feed", "reactions"],
              actions: ["view_driver"]
            }
          ]
        };
      }
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
      },
      addReaction: (
        _: unknown,
        { input }: { input: { author: string; photoDataUrl: string } }
      ): Reaction => {
        const reaction: Reaction = {
          id: randomUUID(),
          author: input.author.trim(),
          photoDataUrl: input.photoDataUrl,
          createdAt: new Date().toISOString()
        };
        reactions.push(reaction);
        eventBus.emit("reaction-added", reaction);
        return reaction;
      }
    }
  }
});
