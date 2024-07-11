import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import schema from "./schema";
import db from "./db";

async function main() {
  await db.authenticate();
  console.info("DB successfully setup");
  const server = new ApolloServer({ schema });
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });
  console.info(`Server ready at: ${url}`);
}

main().catch(console.error);
