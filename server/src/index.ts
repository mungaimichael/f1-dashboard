import cors from "cors";
import express from "express";
import { createYoga } from "graphql-yoga";
import { eventsHandler, startRaceEventSimulator } from "./sse.js";
import { schema } from "./schema.js";

const port = Number(process.env.PORT ?? 4000);
const app = express();

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/graphql",
  cors: {
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }
});

app.use(cors());
app.get("/health", (_request, response) => {
  response.json({ ok: true });
});
app.get("/events", eventsHandler);
app.use("/graphql", yoga);

app.listen(port, () => {
  startRaceEventSimulator();
  console.log(`GraphQL ready at http://localhost:${port}/graphql`);
  console.log(`SSE stream ready at http://localhost:${port}/events`);
});
