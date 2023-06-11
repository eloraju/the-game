import * as E from "fp-ts/lib/Either.js";
import { Command, RpcCommand, Game, Context } from "./types/types.js";
import { Socket } from "socket.io";
import {
  createGame,
  resetBuzzers,
  startGame,
  addPoints,
  deductPoints,
  setPoints,
} from "./commands/admin.js";
import { joinGame, buzz } from "./commands/player.js";

// in memory store for games
const games = new Map<string, Game>();

export function gameExists(gameId: string): boolean {
  console.log(games.get(gameId))
  console.log(Array.from(games.keys()))
  return Boolean(games.get(gameId))
}

export function getGame(gameId: string): E.Either<string, Game> {
  return E.fromNullable("No game found")(games.get(gameId));
}

export function ping(): E.Either<string, string> {
  return E.right("pong");
}

export function print(command: RpcCommand) {
  const game = games.get(command.gameId);
  if (!game) {
    return E.left("No game found");
  }
  return E.right({
    ...game,
    players: Array.from(game.players),
    buzzList: Array.from(game.buzzList),
    points: Array.from(game.points),
  });
}

export function handleRequest(
  command: RpcCommand,
  socketId: string,
  connections: Map<string, Socket>
): E.Either<string, any> {
  // Handle this here so we can populate everything else eagerly
  if (command.cmd === Command.CREATE_GAME)
    return createGame(command, socketId, games);

  const game = games.get(command.gameId);
  if (!game) return E.left("No game found");

  const adminSocket = connections.get(game.adminSocketId);
  if (!adminSocket) return E.left("Admin not found");

  const context: Context = {
    game,
    adminSocket,
    connections,
    socketId,
  };

  switch (command.cmd) {
    case Command.PING:
      return ping();
    case Command.JOIN_GAME:
      return joinGame(command.data, context);
    case Command.BUZZ:
      return buzz(command.data, context);
    case Command.RESET_BUZZERS:
      return resetBuzzers(context);
    case Command.START_GAME:
      return startGame(context);
    case Command.ADD_POINTS:
      return addPoints(command.data, context);
    case Command.DEDUCT_POINTS:
      return deductPoints(command.data, context);
    case Command.SET_POINTS:
      return setPoints(command.data, context);
    case Command.GET_GAME:
      return E.right(game);
    case Command.PRINT_GAME:
      return print(command);
    default:
      return E.left("Unknown command");
  }
}
