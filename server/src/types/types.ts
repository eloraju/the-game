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
  NEXT_PROMPT,
  PRINT_GAME,
  ADD_POINTS,
  DEDUCT_POINTS,
  SET_POINTS,
  START_GAME,
}

export enum Event {
  BUZZ,
  PLAYER_JOIN,
}

export enum GameState {
  LOBBY, // waiting for players to join
  IN_PROGRESS, // Prompting and buzzing
  ENDED,
}

export type Player = string;

export interface Response {
  ack: number;
  data: any;
  err: boolean;
}

export interface Game {
  id: string;
  state: GameState;
  players: Set<Player>;
  buzzList: Set<Player>;
  points: Map<Player, number>;
  adminSocketId: string;
}

export type GameMap = Map<string, Game>;

export interface Context {
  adminSocket: Socket;
  connections: Map<string, Socket>;
  game: Game;
  socketId: string;
}

export interface JoinGameData {
  player: string;
}
export interface BuzzData {
  player: Player;
}
export interface AddPromptData {
  prompt: string; // url or text
  type: "url" | "text";
}
export interface RemovePromptData {
  promptId: string;
}

export interface AddPointsData {
  player: string;
  amount: number;
}
export interface DeductPointsData {
  player: string;
  amount: number;
}

export interface SetPointsData {
  player: string;
  amount: number;
}

interface ICommand<T> {
  cmd: Command;
  ack: number;
  gameId: string;
  data: T;
}

type ICommandNoData = Omit<ICommand<undefined>, "data">;

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
export interface AddPointsCommand extends ICommand<AddPointsData> {
  cmd: Command.ADD_POINTS;
}
export interface DeductPointsCommand extends ICommand<DeductPointsData> {
  cmd: Command.DEDUCT_POINTS;
}
export interface SetPointsCommand extends ICommand<SetPointsData> {
  cmd: Command.SET_POINTS;
}
export interface PingCommand extends ICommandNoData {
  cmd: Command.PING;
}

export interface StartCommand extends ICommandNoData {
  cmd: Command.START_GAME;
}
export interface PrintCommand extends ICommandNoData {
  cmd: Command.PRINT_GAME;
}

interface IEvent<T> {
  event: Event;
  data: T;
}

export interface BuzzEvent extends IEvent<string[]> {
  event: Event.BUZZ;
}

export interface PointsData {
  player: string;
  points: number;
}
export interface JointEvent extends IEvent<PointsData[]> {
  event: Event.PLAYER_JOIN;
}

export type RpcEvent = BuzzEvent | JointEvent;

export type RpcCommand =
  | PingCommand
  | CreateGameCommand
  | JoinGameCommand
  | BuzzCommand
  | ResetBuzzersCommand
  | AddPointsCommand
  | DeductPointsCommand
  | SetPointsCommand
  | StartCommand
  | PrintCommand;

export type RpcCommandData =
  | JoinGameData
  | BuzzCommand
  | AddPromptData
  | RemovePromptData
  | NextPromptCpmmand;
