import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { __PORT__, __COOKIES_SECRET_KEY__, __PROD__, __DOMAIN_FULL__ } from '@constants/env';
import db from './db';
import context from './context';
import schema from './schema';

async function main() {
  await db.authenticate();
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
      origin: __PROD__ ? __DOMAIN_FULL__ : true,
      credentials: true,
    }),
    express.json({ limit: '50mb' }),
    cookieParser(__COOKIES_SECRET_KEY__),
    expressMiddleware(server, {
      context,
    }),
  );

  await new Promise<void>((resolve) => httpServer.listen({ port: __PORT__ }, resolve));
  console.info(`Server ready at http://localhost:${__PORT__}/`);
}

main().catch(console.error);
