import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";

const server = fastify();

server.register(fastifyCors, {
  origin: "*",
});

console.log(process.env.DATABASE_URL);

server.listen({ port: 3333, host: "0.0.0.0" }).then(() => {
  console.log("HTTP server running on port 3333");
});
