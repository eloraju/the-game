import * as E from "fp-ts/lib/Either.js";
import { Command, JoinGameData, RpcCommand, CreateGameData, Game, GameState, Player, BuzzData, CreateGameCommand, BuzzCommand, JoinGameCommand, AddPromptCommand, RemovePromptData, ResetBuzzersCommand, RemovePromptCommand } from "./types/types.js";
import { Socket } from "socket.io";

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

export function joinGame({data}: JoinGameCommand, socketId: string, connections: Map<string, Socket>): E.Either<string, string> {
  const game = games.get(data.gameId);
  if(!game) return E.left("invalid game id");

  const reserved = game.players.has(data.player);
  if(reserved) return E.left("username reserved");

  game.players.add(data.player);

  return E.right("ok");
}

export function createGame({data}:CreateGameCommand, socketId: string, connections: Map<string, Socket>): E.Either<string, string> {
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

export function buzz({data}: BuzzCommand, socketId: string, connections: Map<string, Socket>): E.Either<string, string> {
  return E.left("Not implemeted");
}
export function addPrompt({data}: AddPromptCommand, socketId: string, connections: Map<string, Socket>): E.Either<string, string> {
  return E.left("Not implemeted");
}
export function removePrompt({data}: RemovePromptCommand, socketId: string, connections: Map<string, Socket>): E.Either<string, string> {
  return E.left("Not implemeted");
}
export function resetBuzzers({data}: ResetBuzzersCommand, socketId: string, connections: Map<string, Socket>): E.Either<string, string> {
  return E.left("Not implemeted");
}

export function print(command: RpcCommand) {
  console.log(JSON.stringify(games.get(command.gameId)));
  return E.right("ok")
}

export function handleRequest(command: RpcCommand, socketId: string, connections: Map<string, Socket>): E.Either<string, string> {
  switch(command.cmd) {
    case Command.PING: return ping();
    case Command.CREATE_GAME: return createGame(command, socketId, connections);
    case Command.JOIN_GAME: return joinGame(command, socketId, connections);
    case Command.BUZZ: return buzz(command, socketId, connections);
    case Command.ADD_PROMPT: return addPrompt(command, socketId, connections);
    case Command.REMOVE_PROMPT: return removePrompt(command, socketId, connections);
    case Command.RESET_BUZZERS: return resetBuzzers(command, socketId, connections);
    case Command.PRINT_GAME: return print(command);
    default: return E.left("Unknown command");
  }
}
