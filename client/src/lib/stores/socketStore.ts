import {readable, writable} from "svelte/store";
import {io} from 'socket.io-client';
import { create } from "domain";
import {
	Command,
	type AddPromptData,
	type BuzzData,
	type CreateGameData,
	type JoinGameData,
	type RemovePromptData,
	type ResetBuzzersData,
  type RpcCommand,
  type JoinGameCommand,
  type CreateGameCommand,
  type BuzzCommand,
  type AddPromptCommand,
  type RemovePromptCommand,
  type ResetBuzzersCommand
} from 'server/src/types/types';
import type { Socket } from 'socket.io-client';

const socketClient = io();

export const requests = writable<string[]>([]);
export const responses = writable<string[]>([]);

// TODO: Create type for all responses
export const latestMessage = writable<any|null>(null)


socketClient.on('connection', (id) => {
	requests.update((reqs) => [...reqs, 'Connected']);
	responses.update((ress) => [...ress, `Connected ${id}`]);
});

socketClient.on('res', (data) => {
	responses.update((ress) => [...ress, data]);
  latestMessage.update(_ => JSON.parse(data));
});


function emit(data: RpcCommand, socket: Socket) {
  if(true)  { // TODO: Debug check
    requests.update(reqs => [...reqs, JSON.stringify(data)])
  }

	socket.emit('req', JSON.stringify(data));
}

function joinGame(data: JoinGameData, socket: Socket) {
	const req: JoinGameCommand = { cmd: Command.JOIN_GAME, data };
	emit(req, socket);
}

function createGame(data: CreateGameData, socket: Socket) {
	const req: CreateGameCommand = { cmd: Command.CREATE_GAME, data };
	emit(req, socket);
}

function buzz(data: BuzzData, socket: Socket) {
	const req: BuzzCommand = { cmd: Command.BUZZ, data };
	emit(req, socket);
}

function addPrompt(data: AddPromptData, socket: Socket) {
	const req: AddPromptCommand = { cmd: Command.ADD_PROMPT, data };
	emit(req, socket);
}

function removePrompt(data: RemovePromptData, socket: Socket) {
	const req: RemovePromptCommand = { cmd: Command.REMOVE_PROMPT, data };
	emit(req, socket);
}

function resetBuzzers(data: ResetBuzzersData, socket: Socket) {
	const req: ResetBuzzersCommand = { cmd: Command.RESET_BUZZERS, data };
	emit(req, socket);
}

export const client = {
  ping: () => emit({cmd:Command.PING}, socketClient),
  addPrompt: (data: AddPromptData) => addPrompt(data, socketClient),
  buzz: (data: BuzzData ) => buzz(data, socketClient),
  createGame: (data: CreateGameData ) => createGame(data, socketClient),
  joinGame: (data: JoinGameData ) => joinGame(data, socketClient),
  removePrompt: (data: RemovePromptData) => removePrompt(data, socketClient),
  resetBuzzer: (data: ResetBuzzersData ) => resetBuzzers(data, socketClient),
  receive: ()=>latestMessage.subscribe,
}; 