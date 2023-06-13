import { Server, Socket } from "socket.io";
import { createServer } from "http";
import express from "express";
import { handleRequest } from "./gameHandler.js";
//@ts-ignore
import { handler } from "client/build/handler.js";
import {
  Command,
  type Game,
  type Response,
  type RpcCommand,
  type SocketQueryData,
} from "./types/types.js";
import { match } from "fp-ts/lib/Either.js";
import { createGame } from "./commands/admin.js";
import { getUpdateData } from "./commands/helpers.js";
import { joinGame } from "./commands/player.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

// in memory store for games and connections
const connections = new Map<string, Socket>();
const games = new Map<string, Game>();

io.on("connection", (socket) => {
  console.log(`new client connected`);

  const data = socket.handshake.query as unknown as SocketQueryData;

  socket.join(socket.handshake.query.gameId as string);

  if (data.cmd == Command.CREATE_GAME) {
    createGame(data.gameId, socket.id, games);
    socket.emit("update", getUpdateData(games, data.gameId, data.cmd));
  } else {
    const game = games.get(data.gameId)
    if(!game) {
      socket.emit("err", "No such game")
      socket.disconnect()
      return;
    };
    joinGame(data.name, game);
    io.to(data.gameId).emit("update", getUpdateData(games, data.gameId, data.cmd));
  }

  socket.emit("connection", socket.id);
  connections.set(socket.id, socket);

  socket.on("req", (request, callback) => {
    // Wrap in E.Either at some point since this _could_ throw
    const cmd = JSON.parse(request) as RpcCommand;

    console.log(`Request: ${request}`);
    const data = handleRequest(cmd, socket.id, connections, games);
    // well this is ugly... must get to ipmlementing fp-ts at some point....
    let response: Response = match(
      (error) => ({ data: error, err: true }),
      (result) => ({ data: result, err: false })
    )(data);

    console.log("Response:", JSON.stringify(response));
    callback(JSON.stringify(response));
    io.to(cmd.gameId).emit("update", getUpdateData(games, cmd.gameId, cmd.cmd));
  });
});
app.use(handler);
const port = 3000;

httpServer.listen(port, () => console.log(`Server listening on port ${port}`));
