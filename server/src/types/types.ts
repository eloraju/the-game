export enum Command {
  PING,
  CREATE_GAME,
  JOIN_GAME,
  LEAVE_GAME,
}

export interface createGameData {
  gameId?: string;
}

export interface JoinGameData {
  username: string;
  gameId: string;
}

export interface CreateGameCommand {
  cmd: Command.CREATE_GAME;
  data: createGameData;
}

export interface JoinGameCommand {
  cmd: Command.JOIN_GAME;
  data: JoinGameData;
}

export interface PingCommand {
  cmd: Command.PING;
  data: undefined
}

export type RpcCommand = CreateGameCommand | JoinGameCommand | PingCommand
