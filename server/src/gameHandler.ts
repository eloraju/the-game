import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import {Command, RpcCommand, createGameData, JoinGameData} from 'shared';
const games = new Map<string, string[]>();

function getGame(gameId: string): O.Option<any> {
  return O.fromNullable(games.get(gameId));
}

export function joinGame({username, gameId}: JoinGameData): E.Either<Error, boolean> {
  const game = games.get(gameId);
  if(!game) return E.left(new Error("invalid game id"));

  const reserved = game.find(user=>username === user);
  if(reserved) return E.left(new Error("username reserved"));

  games.set(gameId, [...game, username]);

  return E.right(true);
}

export function leaveGame(username: string, gameId: string): E.Either<Error, boolean> {
  const game = games.get(gameId);
  if(!game) return E.left(new Error("invalid game id"));

  const reserved = game.find(user=>username === user);
  if(reserved) return E.left(new Error("username reserved"));

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

export function createGame({gameId}:createGameData): E.Either<Error, string> {
  if(gameId && games.get(gameId)) return E.left(new Error("Name taken"))
  const newId = generateId();
  games.set(newId, []);
  return E.right(gameId || newId);
}

export function handle({cmd, data}: RpcCommand): any {
  switch(cmd) {
    case Command.CREATE_GAME: return createGame(data)
    case Command.JOIN_GAME: return joinGame(data)
    default: return null;
  }
}
