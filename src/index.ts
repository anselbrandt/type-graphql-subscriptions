import ServerConfig from "./src/configs/server.config";
import chalk from "chalk";
import dotenv from "dotenv";
import { ApolloServer } from "apollo-server-express";
import { buildSchemaSync } from "type-graphql";
import "reflect-metadata";
import { Resolvers } from "./src/graphql";
import http from "http";

const PORT = process.env.SERVER_PORT || 4000;

dotenv.config();
ServerConfig.getExpress()
  .then(({ appExpress, pubsub }) => {
    const schema = buildSchemaSync({
      resolvers: Resolvers(),
      pubSub: pubsub,
    });
    const server = new ApolloServer({
      schema,
      context: (context) => context,
      subscriptions: {
        onConnect(connectionParams, webSocket) {},
        onDisconnect() {},
      },
    });
    server.applyMiddleware({ app: appExpress, path: "/graphql" });
    const httpServer = http.createServer(appExpress);
    server.installSubscriptionHandlers(httpServer);
    httpServer.listen(Number(PORT), () => {
      console.log(
        chalk.green(`Server started at http://localhost:${PORT}/graphql`)
      );
    });
  })
  .catch((error) => {
    console.log(
      chalk.red(`Unable to start server on port ${PORT}
      Error: ${error}`)
    );
  });
