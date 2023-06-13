import * as E from "fp-ts/lib/Either.js";
import { Command, RpcCommand, Game, Context } from "./types/types.js";
import { Socket } from "socket.io";
import {
  resetBuzzers,
  startGame,
  addPoints,
  deductPoints,
  setPoints,
  endGame,
} from "./commands/admin.js";
import { buzz } from "./commands/player.js";

export function ping(): E.Either<string, string> {
  return E.right("pong");
}

export function print(context: Context) {
  return E.right({
    ...context.game,
    players: Array.from(context.game.players),
    buzzList: Array.from(context.game.buzzList),
    points: Array.from(context.game.points),
  });
}

export function handleRequest(
  command: RpcCommand,
  socketId: string,
  connections: Map<string, Socket>,
  games: Map<string, Game>
): E.Either<string, any> {
  // Create game is handled outside of this handler for now :)

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
    case Command.BUZZ:
      return buzz(command.data, context);
    case Command.RESET_BUZZERS:
      return resetBuzzers(context);
    case Command.START_GAME:
      return startGame(context);
    case Command.END_GAME:
      return endGame(context);
    case Command.ADD_POINTS:
      return addPoints(command.data, context);
    case Command.DEDUCT_POINTS:
      return deductPoints(command.data, context);
    case Command.SET_POINTS:
      return setPoints(command.data, context);
    case Command.GET_GAME:
      return E.right(game);
    case Command.PRINT_GAME:
      return print(context);
    default:
      return E.left("Unknown command");
  }
}
