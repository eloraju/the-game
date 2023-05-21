import {Command, type AddPromptData, type BuzzData, type CreateGameData, type JoinGameData, type RemovePromptData, type ResetBuzzersData} from 'server/src/types/types';
import type { Socket } from 'socket.io-client';

export function joinGame(data: JoinGameData, socket: Socket) {
  const req = {cmd: Command.JOIN_GAME, data}
  socket.emit("req", JSON.stringify(req));
}

export function createGame(data:CreateGameData, socket: Socket) {
  const req = {cmd: Command.CREATE_GAME, data}
  socket.emit("req", JSON.stringify(req));
}

export function buzz(data: BuzzData, socket: Socket) {
  const req = {cmd: Command.BUZZ, data}
  socket.emit("req", JSON.stringify(req));
}

export function addPrompt(data: AddPromptData, socket: Socket) {
  const req = {cmd: Command.ADD_PROMPT, data}
  socket.emit("req", JSON.stringify(req));
}

export function removePrompt(data: RemovePromptData, socket: Socket) {
  const req = {cmd: Command.REMOVE_PROMPT, data}
  socket.emit("req", JSON.stringify(req));
}

export function resetBuzzers(data: ResetBuzzersData, socket: Socket) {
  const req = {cmd: Command.RESET_BUZZERS, data}
  socket.emit("req", JSON.stringify(req));
}
