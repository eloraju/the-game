import {
  type AddPointsData,
  type Context,
  type Game,
  type GameMap,
  GameState,
  type PointsData,
  type SetPointsData,
} from "../types/types.js";
import * as E from "fp-ts/lib/Either.js";
import { getSortedPoints } from "./helpers.js";

export function createGame(
  gameId: string,
  socketId: string,
  games: GameMap
): E.Either<string, string> {
  if (games.get(gameId)) return E.left("Game already exists");

  games.set(gameId, {
    adminSocketId: socketId,
    id: gameId,
    state: GameState.LOBBY,
    players: new Set(),
    points: new Map(),
    buzzList: new Set(),
  });

  return E.right("ok");
}

export function startGame({ game }: Context): E.Either<string, string> {
  game.state = GameState.ACCEPTING_BUZZEZ;
  return E.right("game started!");
}

export function endGame({ game }: Context): E.Either<string, string> {
  game.state = GameState.ENDED;
  return E.right("game ended!");
}

export function resetBuzzers({ game }: Context): E.Either<string, string[]> {
  game.buzzList.clear();
  game.state = GameState.ACCEPTING_BUZZEZ;

  return E.right([]);
}

export function getNewPoints(
  player: string,
  amount: number,
  game: Game
): E.Either<string, number> {
  const points = game.points.get(player);
  if (points === undefined)
    return E.left(`getNewPoints: no player found ${player}`);
  return E.right(points + amount);
}

export function setPoints(
  { player, amount }: SetPointsData,
  { game }: Context
) {
  const points = game.points.get(player);
  if (points === undefined) return E.left(`no player found ${player}`);

  game.points.set(player, amount);

  return E.right(getSortedPoints(game));
}

export function addPoints(
  { player, amount }: AddPointsData,
  context: Context
): E.Either<string, PointsData[]> {
  const result = getNewPoints(player, amount, context.game);
  return E.match(
    (err: string) => E.left(`addPoints: ${err}`),
    (newPoints: number) => setPoints({ player, amount: newPoints }, context)
  )(result);
}

export function deductPoints(
  { player, amount }: AddPointsData,
  context: Context
): E.Either<string, PointsData[]> {
  const result = getNewPoints(player, -amount, context.game);
  return E.match(
    (err: string) => E.left(`deductPoints: ${err}`),
    (newPoints: number) => setPoints({ player, amount: newPoints }, context)
  )(result);
}
