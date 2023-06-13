import { writable } from 'svelte/store';
import { Socket, io } from 'socket.io-client';
import {
	Command,
	type RpcCommand,
	type BuzzCommand,
	type ResetBuzzersCommand,
	type Response,
	type PrintCommand,
	type AddPointsCommand,
	type DeductPointsCommand,
	type SetPointsCommand,
	type StartCommand,
	type GetGameCommand,
	type UpdateForUI,
	type EndGameCommand
} from 'server/src/types/types';
import { noop } from 'svelte/internal';

let socketClient: Socket; // = io({query: {gameId: "test"}});

let inGame = false;
export const role = writable<'player' | 'admin' | 'spectate'>();
export const gameData = writable<UpdateForUI>();
export let currentGame: { gameId: string; player: string };

export function openSocket(
	gameId: string,
	name: string,
	cmd: Command.JOIN_GAME | Command.CREATE_GAME
) {
	socketClient = io({
		query: {
			gameId,
			name,
			cmd
		},
  reconnectionAttempts: 1
	});

	socketClient.on('err', (err) => {
		console.log(`Error: ${err}`);
	});

	socketClient.on('connection', (_) => {
		console.log(`Connected to game ${gameId} as ${name}`);
	});

	currentGame = { gameId, player: name };

	socketClient.on('update', (gameStr) => {
		console.log(gameStr);
		const game = JSON.parse(gameStr) as UpdateForUI;
		gameData.set(game);
		if (!inGame) {
			if (game.cmd == Command.CREATE_GAME) {
				role.set('admin');
			}
			if (game.cmd == Command.JOIN_GAME) {
				role.set('player');
			}
			inGame = true;
		}
	});
}

function emit(command: RpcCommand, handler: (res: Response) => void = noop) {
	// This increments the ack for the next round
	console.log('REQUEST:', JSON.stringify(command));
	socketClient
		.timeout(3 * 1000)
		.emitWithAck('req', JSON.stringify(command))
		.then((res) => {
			console.log(`RESPONSE: ${res}`);
			handler(res);
		})
		.catch(err => console.error(err));
}

function joinGame(gameId: string, player: string) {
	openSocket(gameId, player, Command.JOIN_GAME);
}

function createGame(gameId: string) {
	openSocket(gameId, 'admin', Command.CREATE_GAME);
}

function buzz() {
	const req: BuzzCommand = {
		cmd: Command.BUZZ,
		gameId: currentGame.gameId,
		data: { player: currentGame.player }
	};
	emit(req);
}

function resetBuzzers() {
	const req: ResetBuzzersCommand = { cmd: Command.RESET_BUZZERS, gameId: currentGame.gameId };
	emit(req);
}

function printGame() {
	const req: PrintCommand = { cmd: Command.PRINT_GAME, gameId: currentGame.gameId };
	emit(req);
}

function mutatePoints(
	cmd: Command.ADD_POINTS | Command.DEDUCT_POINTS | Command.SET_POINTS,
	player: string,
	amount: number
) {
	const req: SetPointsCommand | AddPointsCommand | DeductPointsCommand = {
		cmd,
		gameId: currentGame.gameId,
		data: { player, amount }
	};
	emit(req);
}

function startGame() {
	const req: StartCommand = { cmd: Command.START_GAME, gameId: currentGame.gameId };
	emit(req);
}

function getGame(gameId: string) {
	const req: GetGameCommand = { cmd: Command.GET_GAME, gameId };
	emit(req, (res) => gameData.set(res.data));
}

function endGame() {
	const req: EndGameCommand = { cmd: Command.END_GAME, gameId: currentGame.gameId };
	emit(req);
}

export const client = {
	ping: () => emit({ cmd: Command.PING, gameId: 'none' }),
	openSocket,
	buzz,
	createGame,
	joinGame,
	printGame,
	resetBuzzers,
	endGame,
	addPoints: (player: string, amount: number) => mutatePoints(Command.ADD_POINTS, player, amount),
	deductPoints: (player: string, amount: number) =>
		mutatePoints(Command.DEDUCT_POINTS, player, amount),
	setPoints: (player: string, amount: number) => mutatePoints(Command.SET_POINTS, player, amount),
	getGame,
	startGame,
	onRoleReceived: role.subscribe
};
