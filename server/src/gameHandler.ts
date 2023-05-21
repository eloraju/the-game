import * as E from "fp-ts/lib/Either.js";
import { Command, JoinGameData, RpcCommand, createGameData } from "./types/types.js";

// in memory store for games
const games = new Map<string, string[]>();

export function ping(): E.Either<string, string> {
  return E.right("pong");
}

export function joinGame({username, gameId}: JoinGameData): E.Either<string, boolean> {
  const game = games.get(gameId);
  if(!game) return E.left("invalid game id");

  const reserved = game.find(user=>username === user);
  if(reserved) return E.left("username reserved");

  games.set(gameId, [...game, username]);

  return E.right(true);
}

export function leaveGame(username: string, gameId: string): E.Either<string, boolean> {
  const game = games.get(gameId);
  if(!game) return E.left("invalid game id");

  const reserved = game.find(user=>username === user);
  if(reserved) return E.left("username reserved");

  games.set(gameId, game.filter(u => u !== username));

  return E.right(true);
}

function generateId(): string {
  // 5 random alphanumeric characthers
  const canditate = Math.random().toString(36).slice(2,7);
  if(games.get(canditate)) {
    return generateId();
  }

  return canditate;
}

export function createGame({gameId}:createGameData): E.Either<string, string> {
  if(gameId && games.get(gameId)) return E.left("Game already exists");
  const newId = generateId();
  games.set(newId, []);
  return E.right(gameId || newId);
}

export function handleRequest({cmd, data}: RpcCommand): E.Either<string, any> {
  console.log(cmd)
  switch(cmd) {
    case Command.CREATE_GAME: return createGame(data);
    case Command.JOIN_GAME: return joinGame(data);
    case Command.PING: return ping();
    default: return E.left("Unknown command");
  }
}
