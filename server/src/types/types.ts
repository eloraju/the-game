import { Socket } from "socket.io";

export enum Command {
  PING,
  CREATE_GAME,
  JOIN_GAME,
  LEAVE_GAME,
  BUZZ,
  ADD_PROMPT,
  REMOVE_PROMPT,
  RESET_BUZZERS,
  NEXT_PROMPT
}

export enum GameState {
  LOBBY, // waiting for players to join
    IN_PROGRESS, // Prompting and buzzing
  ENDED
}

export type Player = string;

export interface Game {
  id: string;
  state: GameState;
  prompts: any[]; // TODO: Create interface for these
    curRound: number;
  players: Set<Player>;
  buzzList: Player[];
  points: Map<Player, number>;
  adminId: string;
}

export interface CreateGameData {
  gameId: string;
}
export interface JoinGameData {
  player: string;
  gameId: string;
}
export interface BuzzData {
  player: Player;
  gameId: string;
}
export interface ResetBuzzersData {
  gameId: string
}
export interface  AddPromptData {
  gameId: string;
  prompt: string; // url or text
  type: "url" | "text";
}
export interface  RemovePromptData {
  gameId: string;
  promptId: string;
}
export interface  NextPromptData {
  gameId: string;
}

interface ICommand<T> {
  cmd: Command;
  data: T;
}

export interface CreateGameCommand extends ICommand<CreateGameData> {
  cmd: Command.CREATE_GAME;
}
export interface JoinGameCommand extends ICommand<JoinGameData> {
  cmd: Command.JOIN_GAME;
}
export interface BuzzCommand extends ICommand<BuzzData> {
  cmd: Command.BUZZ;
}
export interface ResetBuzzersCommand extends ICommand<ResetBuzzersData> {
  cmd: Command.RESET_BUZZERS;
}
export interface AddPromptCommand extends ICommand<AddPromptData> {
  cmd: Command.ADD_PROMPT;
}
export interface RemovePromptCommand extends ICommand<RemovePromptData> {
  cmd: Command.REMOVE_PROMPT;
}
export interface NextPromptCpmmand extends ICommand<NextPromptData> {
  cmd: Command.NEXT_PROMPT;
}
export interface PingCommand extends Omit<ICommand<undefined>, "data"> {
  cmd: Command.PING;
}


export type RpcCommand =
  | PingCommand
  | CreateGameCommand
  | JoinGameCommand
  | BuzzCommand
  | ResetBuzzersCommand
  | AddPromptCommand
  | RemovePromptCommand
  | NextPromptCpmmand;

export type RpcCommandData =
  | CreateGameData
  | JoinGameData
  | BuzzCommand
  | ResetBuzzersData
  | AddPromptData
  | RemovePromptData
  | NextPromptCpmmand;