import { Command } from "./enums";

export interface SomeRandomInterface {
  yolo: string;
}

type CommandData = any;

export interface IRpcCommand {
  cmd: Command;
  data: CommandData;
}

export interface createGameData {
  gameId?: string;
}

export interface JoinGameData {
  username: string;
  gameId: string;
}

export interface createGameCommand {
  cmd: Command.CREATE_GAME;
  data: createGameData;
}

export interface joinGameCommand {
  cmd: Command.JOIN_GAME;
  data: JoinGameData;
}

export type RpcCommand = createGameCommand | joinGameCommand
