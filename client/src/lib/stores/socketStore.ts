import {writable} from "svelte/store";
import {io} from 'socket.io-client';
import {
	Command,
	type AddPromptData,
	type BuzzData,
	type JoinGameData,
	type RemovePromptData,
  type RpcCommand,
  type JoinGameCommand,
  type CreateGameCommand,
  type BuzzCommand,
  type AddPromptCommand,
  type RemovePromptCommand,
  type ResetBuzzersCommand,
  type Response
} from 'server/src/types/types';
import type { Socket } from 'socket.io-client';
import { noop } from "svelte/internal";

const socketClient = io();

export const requests = writable<string[]>([]);
export const responses = writable<string[]>([]);

// TODO: Create type for all responses
export const latestMessage = writable<any|null>(null)
const currentGameId = writable<string|null>(null)
const responseHandlers: Array<(res: Response)=>void> = [];
let ack = 0;


socketClient.on('connection', (id) => {
	requests.update((reqs) => [...reqs, 'Connected']);
	responses.update((ress) => [...ress, `Connected ${id}`]);
});

socketClient.on('res', (data) => {
	responses.update((ress) => [...ress, data]);
  latestMessage.update(_ => JSON.parse(data));
});


function emit(data: Omit<RpcCommand, "ack">, socket: Socket, handler?: (res: Response)=>void) {
  if(true)  { // TODO: Debug check
    requests.update(reqs => [...reqs, JSON.stringify(data)])
  }
	// This increments the ack for the next round
  	ack = responseHandlers.push(handler ?? noop);
	socket.emit('req', JSON.stringify(data));
}

function joinGame(gameId: string, data: JoinGameData, socket: Socket) {
	const req: JoinGameCommand = { cmd: Command.JOIN_GAME, gameId, data, ack }
	emit(req, socket, _ => currentGameId.update(_ => gameId));
}

function createGame(gameId: string, socket: Socket) {
	const req: CreateGameCommand = { cmd: Command.CREATE_GAME, gameId, ack };
	emit(req, socket);
}

function buzz(gameId: string, data: BuzzData, socket: Socket) {
	const req: BuzzCommand = { cmd: Command.BUZZ, gameId, data, ack };
	emit(req, socket);
}

function addPrompt(gameId: string, data: AddPromptData, socket: Socket) {
	const req: AddPromptCommand = { cmd: Command.ADD_PROMPT, gameId, data, ack };
	emit(req, socket);
}

function removePrompt(gameId: string, data: RemovePromptData, socket: Socket) {
	const req: RemovePromptCommand = { cmd: Command.REMOVE_PROMPT, gameId, data, ack};
	emit(req, socket);
}

function resetBuzzers(gameId: string, socket: Socket) {
	const req: ResetBuzzersCommand = { cmd: Command.RESET_BUZZERS, gameId, ack};
	emit(req, socket);
}

export const client = {
  ping: () => emit({cmd:Command.PING, gameId: "none"}, socketClient),
  addPrompt: (data: AddPromptData) => addPrompt(data, socketClient),
  buzz: (data: BuzzData ) => buzz(data, socketClient),
  createGame: (data: CreateGameData ) => createGame(data, socketClient),
  joinGame: (data: JoinGameData ) => joinGame(data, socketClient),
  removePrompt: (data: RemovePromptData) => removePrompt(data, socketClient),
  resetBuzzer: (data: ResetBuzzersData ) => resetBuzzers(data, socketClient),
  receive: ()=>latestMessage.subscribe,
}; 