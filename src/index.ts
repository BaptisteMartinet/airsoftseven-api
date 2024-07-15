import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import schema from './schema';
import db from './db';
import context from './context';

async function main() {
  await db.authenticate();
  // await db.sync({ force: true }); // TODO remove
  console.info('DB successfully setup');

  const app = express();
  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();

  app.use(
    '/',
    cors<cors.CorsRequest>({
      origin: true, // TODO airsfoturl,
      credentials: true,
    }),
    express.json({ limit: '50mb' }),
    cookieParser(),
    expressMiddleware(server, {
      context,
    }),
  );

  await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
  console.log(`Server ready at http://localhost:4000/`);
}

main().catch(console.error);
