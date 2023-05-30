import * as E from "fp-ts/lib/Either.js";
import {
  Command,
  RpcCommand,
  Game,
  GameState,
  CreateGameCommand,
  BuzzCommand,
  JoinGameCommand,
  ResetBuzzersCommand,
  AddPointsData,
  BuzzEvent,
  Event,
  JoinGameData,
  PointsData,
  BuzzData,
  SetPointsData,
  JointEvent,
} from "./types/types.js";
import { Socket } from "socket.io";

// in memory store for games
const games = new Map<string, Game>();

export function ping(): E.Either<string, string> {
  return E.right("pong");
}

function generateId(): string {
  // 5 random alphanumeric characthers
  const canditate = Math.random().toString(36).slice(2, 7);
  if (games.get(canditate)) return generateId();

  return canditate;
}

// TODO: Implement fp-ts

export function playerIsInGame(gameId: string, playerId: string): boolean {
  const game = games.get(gameId);
  return Boolean(game) && game!.players.has(playerId);
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

export function joinGame(
  { player }: JoinGameData,
  game: Game,
  adminSocket: Socket
): E.Either<string, string> {
  const reserved = game.players.has(player);
  if (reserved) return E.left("username reserved");

  game.players.add(player);
  game.points.set(player, 0);

  adminSocket.emit("event", JSON.stringify({data: getSortedPoints(game), event: Event.PLAYER_JOIN}))

  return E.right("ok");
}

export function createGame(
  { gameId }: CreateGameCommand,
  socketId: string
): E.Either<string, string> {
  if (games.get(gameId)) return E.left("Game already exists");

  games.set(gameId, {
    adminSocketId: socketId,
    id: gameId,
    state: GameState.LOBBY,
    players: new Set(),
    points: new Map(),
    buzzList: new Set(),
  });

  return E.right("ok");
}

export function startGame(gameId: string): E.Either<string, string> {
  const game = games.get(gameId);
  if (!game) return E.left("Game not found");
  game.state = GameState.IN_PROGRESS;
  games.set(gameId, game);
  return E.right("game started!");
}

export function buzz(
  gameId: string,
  { player }: BuzzData,
  adminSocket: Socket
): E.Either<string, string> {
  const game = games.get(gameId);
  if (!game) return E.left("invalid game id");

  if (game.state !== GameState.IN_PROGRESS) {
    return E.left("not accepting buzzes");
  }

  game.buzzList.add(player);
  games.set(gameId, game);

  const buzzEvent: BuzzEvent = {
    event: Event.BUZZ,
    data: Array.from(game.buzzList),
  };
  adminSocket.emit("event", JSON.stringify(buzzEvent));

  return E.right("ok");
}

export function resetBuzzers(gameId: string): E.Either<string, string[]> {
  const game = games.get(gameId);
  if (!game) return E.left("invalid game id");

  game.buzzList.clear();
  games.set(gameId, game);

  return E.right([]);
}

function getNewPoints(
  gameId: string,
  player: string,
  amount: number
): E.Either<string, number> {
  const game = games.get(gameId);
  if (!game) return E.left("invalid game id");
  const points = game.points.get(player);
  if (points === undefined) return E.left(`getNewPoints: no player found ${player}`);
  return E.right(points + amount);
}

function getSortedPoints(game: Game): PointsData[] {
  return Array.from(game.points)
    .map(([player, points]) => ({ player, points }))
    .sort((a, b) => b.points - a.points);
}

export function setPoints(gameId: string, { player, amount }: SetPointsData) {
  const game = games.get(gameId);
  if (!game) return E.left("invalid game id");
  const points = game.points.get(player);
  if (points === undefined) return E.left(`no player found ${player}`);

  game.points.set(player, amount);
  games.set(gameId, game);

  return E.right(getSortedPoints(game));
}

export function addPoints(
  gameId: string,
  { player, amount }: AddPointsData
): E.Either<string, PointsData[]> {
  const result = getNewPoints(gameId, player, amount);
  return E.match(
    (err: string) => E.left(`addPoints:${err}`),
    (newPoints: number) => setPoints(gameId, { player, amount: newPoints })
  )(result);
}

export function deductPoints(
  gameId: string,
  { player, amount }: AddPointsData
): E.Either<string, PointsData[]> {
  const result = getNewPoints(gameId, player, -amount);
  return E.match(
    (err: string) => E.left(err),
    (newPoints: number) => setPoints(gameId, { player, amount: newPoints })
  )(result);
}

export function handleRequest(
  command: RpcCommand,
  socketId: string,
  connections: Map<string, Socket>
): E.Either<string, any> {
  // Handle this here so we can populate everything else eagerly
  if (command.cmd === Command.CREATE_GAME) return createGame(command, socketId);

  const game = games.get(command.gameId);
  if (!game) return E.left("No game found");

  const adminSocket = connections.get(game.adminSocketId);
  if (!adminSocket) return E.left("Admin not found");
  const playerSocket = connections.get(socketId);
  if (!playerSocket) return E.left("Unknown socket");

  switch (command.cmd) {
    case Command.PING:
      return ping();
    case Command.JOIN_GAME:
      return joinGame(command.data, game, adminSocket);
    case Command.BUZZ:
      return buzz(command.gameId, command.data, adminSocket);
    case Command.RESET_BUZZERS:
      return resetBuzzers(command.gameId);
    case Command.START_GAME:
      return startGame(command.gameId);
    case Command.ADD_POINTS:
      return addPoints(command.gameId, command.data);
    case Command.DEDUCT_POINTS:
      return deductPoints(command.gameId, command.data);
    case Command.SET_POINTS:
      return setPoints(command.gameId, command.data);
    case Command.PRINT_GAME:
      return print(command);
    default:
      return E.left("Unknown command");
  }
}
