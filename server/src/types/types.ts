export enum Command {
  PING,
  CREATE_GAME,
  JOIN_GAME,
  LEAVE_GAME,
  BUZZ,
  ADD_PROMPT,
  REMOVE_PROMPT,
  RESET_BUZZERS,
  NEXT_PROMPT,
  PRINT_GAME
}

export enum GameState {
  LOBBY, // waiting for players to join
    IN_PROGRESS, // Prompting and buzzing
  ENDED
}

export type Player = string;

export interface Response {
  ack: number;
  data: any;
}

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

export interface JoinGameData {
  player: string;
}
export interface BuzzData {
  player: Player;
}
export interface  AddPromptData {
  prompt: string; // url or text
  type: "url" | "text";
}
export interface  RemovePromptData {
  promptId: string;
}

interface ICommand<T> {
  cmd: Command;
  gameId: string
  ack: number;
  data: T;
}

type ICommandNoData = Omit<ICommand<undefined>, "data">

export interface CreateGameCommand extends ICommandNoData {
  cmd: Command.CREATE_GAME;
}
export interface JoinGameCommand extends ICommand<JoinGameData> {
  cmd: Command.JOIN_GAME;
}
export interface BuzzCommand extends ICommand<BuzzData> {
  cmd: Command.BUZZ;
}
export interface ResetBuzzersCommand extends ICommandNoData {
  cmd: Command.RESET_BUZZERS;
}
export interface AddPromptCommand extends ICommand<AddPromptData> {
  cmd: Command.ADD_PROMPT;
}
export interface RemovePromptCommand extends ICommand<RemovePromptData> {
  cmd: Command.REMOVE_PROMPT;
}
export interface NextPromptCpmmand extends ICommandNoData {
  cmd: Command.NEXT_PROMPT;
}
export interface PingCommand extends ICommandNoData {
  cmd: Command.PING;
} 

export interface PrintCommand extends ICommandNoData {
  cmd: Command.PRINT_GAME;
}

export type RpcCommand =
  | PingCommand
  | CreateGameCommand
  | JoinGameCommand
  | BuzzCommand
  | ResetBuzzersCommand
  | AddPromptCommand
  | RemovePromptCommand
  | NextPromptCpmmand
  | PrintCommand;

export type RpcCommandData =
  | JoinGameData
  | BuzzCommand
  | AddPromptData
  | RemovePromptData
  | NextPromptCpmmand;