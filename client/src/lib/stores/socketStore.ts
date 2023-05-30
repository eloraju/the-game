import { writable } from 'svelte/store';
import { io } from 'socket.io-client';
import {
	Command,
	type RpcCommand,
	type JoinGameCommand,
	type CreateGameCommand,
	type BuzzCommand,
	type ResetBuzzersCommand,
	type Response,
	type PrintCommand,
	type AddPointsCommand,
	type DeductPointsCommand,
	type SetPointsCommand,
	type RpcEvent,
	Event,
	type StartCommand,
	type PointsData,
	type JointEvent
} from 'server/src/types/types';
import { noop } from 'svelte/internal';

const socketClient = io();

export const requests = writable<string[]>([]);
export const responses = writable<string[]>([]);
export const role = writable<'player' | 'admin'>();
export const points = writable<PointsData[]>();
export const buzzList = writable<string[]>([]);

// TODO: Create type for all responses
export const latestMessage = writable<any | null>(null);
const responseHandlers: Map<number, (res: Response) => void> = new Map();

let ack = 0;
let currentGame: { gameId: string; player: string };

socketClient.on('connection', (id) => {
	requests.update((reqs) => [...reqs, 'Connected']);
	responses.update((ress) => [...ress, `Connected ${id}`]);
});

socketClient.on('event', (eventStr: string) => {
	console.log('EVENT:', eventStr);
	const event = JSON.parse(eventStr) as RpcEvent;
	switch (event.event) {
		case Event.BUZZ:
			buzzList.set(event.data);
			break;
		case Event.PLAYER_JOIN:
			points.set((event as JointEvent).data);
			break;
		default:
			console.log('unknown event', eventStr);
			break;
	}
});

socketClient.on('res', (data) => {
	const res = JSON.parse(data);
	responses.update((ress) => [...ress, data]);
	console.log('RESPONSE:', data);
	const handler = responseHandlers.get(res.ack);
	if (!handler) {
		console.log('handler not found for ack', res.ack);
		return;
	}
	handler(res);
});

function emit(command: RpcCommand, handler?: (res: Response) => void) {
	if (true) {
		// TODO: Debug check
		requests.update((reqs) => [...reqs, JSON.stringify(command)]);
	}
	// This increments the ack for the next round
	responseHandlers.set(command.ack, handler ?? noop);
	ack += 1;
	console.log('REQUEST:', JSON.stringify(command));
	socketClient.emit('req', JSON.stringify(command));
}

function joinGame(gameId: string, player: string) {
	const req: JoinGameCommand = { ack, cmd: Command.JOIN_GAME, gameId, data: { player } };
	currentGame = { gameId, player };
	emit(req, (_) => {
		role.set('player');
	});
}

function createGame(gameId: string) {
	const req: CreateGameCommand = { ack, cmd: Command.CREATE_GAME, gameId };
	currentGame = { gameId, player: 'admin' };
	role.set('admin');
	emit(req);
}

function buzz() {
	const req: BuzzCommand = {
		ack,
		cmd: Command.BUZZ,
		gameId: currentGame.gameId,
		data: { player: currentGame.player }
	};
	emit(req);
}

function resetBuzzers() {
	const req: ResetBuzzersCommand = { cmd: Command.RESET_BUZZERS, gameId: currentGame.gameId, ack };
	emit(req, (_) => buzzList.set([]));
}

function printGame() {
	const req: PrintCommand = { cmd: Command.PRINT_GAME, gameId: currentGame.gameId, ack };
	emit(req);
}

function mutatePoints(
	cmd: Command.ADD_POINTS | Command.DEDUCT_POINTS | Command.SET_POINTS,
	player: string,
	amount: number
) {
	const req: SetPointsCommand | AddPointsCommand | DeductPointsCommand = {
		ack,
		cmd,
		gameId: currentGame.gameId,
		data: { player, amount }
	};
	emit(req, (res) => points.set(res.data));
}

function startGame() {
	const req: StartCommand = { ack, cmd: Command.START_GAME, gameId: currentGame.gameId };
	emit(req);
}

export const client = {
	ping: () => emit({ cmd: Command.PING, gameId: 'none', ack }),
	buzz: () => buzz(),
	createGame: (gameId: string) => createGame(gameId),
	joinGame: (gameId: string, player: string) => joinGame(gameId, player),
	printGame: () => printGame(),
	resetBuzzer: () => resetBuzzers(),
	addPoints: (player: string, amount: number) => mutatePoints(Command.ADD_POINTS, player, amount),
	deductPoints: (player: string, amount: number) =>
		mutatePoints(Command.DEDUCT_POINTS, player, amount),
	setPoints: (player: string, amount: number) => mutatePoints(Command.SET_POINTS, player, amount),
	startGame: () => startGame(),
	onRoleReceived: role.subscribe
};
