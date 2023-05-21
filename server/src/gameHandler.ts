import * as E from "fp-ts/lib/Either.js";
import { Command, JoinGameData, RpcCommand, CreateGameData, Game, GameState, Player, BuzzData, CreateGameCommand, BuzzCommand, JoinGameCommand, AddPromptCommand, RemovePromptData, ResetBuzzersCommand, RemovePromptCommand } from "./types/types.js";

// in memory store for games
const games = new Map<string, Game>();

export function ping(): E.Either<string, string> {
  return E.right("pong");
}


function generateId(): string {
  // 5 random alphanumeric characthers
  const canditate = Math.random().toString(36).slice(2,7);
  if(games.get(canditate)) return generateId()

  return canditate;
}

// TODO: Implement fp-ts

export function playerIsInGame(gameId: string, playerId: string): boolean {
  const game = games.get(gameId);
  return Boolean(game) && game!.players.has(playerId);
}

export function joinGame({data, socketId, connections}: JoinGameCommand): E.Either<string, string> {
  const game = games.get(data.gameId);
  if(!game) return E.left("invalid game id");

  const reserved = game.players.has(data.player);
  if(reserved) return E.left("username reserved");

  game.players.add(data.player);

  return E.right("ok");
}

export function createGame({data, socketId}:CreateGameCommand): E.Either<string, string> {
  if(games.get(data.gameId)) return E.left("Game already exists");
  games.set(data.gameId, {
    adminId: socketId,
    id: data.gameId,
    curRound: 0,
    prompts: [] as any[],
    state: GameState.LOBBY,
    players: new Set(),
    points: new Map(),
    buzzList: [] as Player[]
  });
  return E.right("ok");
}

export function buzz({data, socketId, connections}: BuzzCommand): E.Either<string, string> {
  return E.left("Not implemeted");
}
export function addPrompt({data, socketId, connections}: AddPromptCommand): E.Either<string, string> {
  return E.left("Not implemeted");
}
export function removePrompt({data, socketId, connections}: RemovePromptCommand): E.Either<string, string> {
  return E.left("Not implemeted");
}
export function resetBuzzers({data, socketId, connections}: ResetBuzzersCommand): E.Either<string, string> {
  return E.left("Not implemeted");
}

export function handleRequest(command: RpcCommand): E.Either<string, string> {
  switch(command.cmd) {
    case Command.PING: return ping();
    case Command.CREATE_GAME: return createGame(command);
    case Command.JOIN_GAME: return joinGame(command);
    case Command.BUZZ: return buzz(command);
    case Command.ADD_PROMPT: return addPrompt(command);
    case Command.REMOVE_PROMPT: return removePrompt(command);
    case Command.RESET_BUZZERS: return resetBuzzers(command);
    default: return E.left("Unknown command");
  }
}
