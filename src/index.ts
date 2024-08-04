import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { PORT, COOKIES_SECRET_KEY, PROD, DOMAIN_FULL } from '@constants/env';
import db from './db';
import context from './context';
import schema from './schema';

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
      origin: PROD ? DOMAIN_FULL : true,
      credentials: true,
    }),
    express.json({ limit: '50mb' }),
    cookieParser(COOKIES_SECRET_KEY),
    expressMiddleware(server, {
      context,
    }),
  );

  await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.info(`Server ready at http://localhost:${PORT}/`);
}

main().catch(console.error);
