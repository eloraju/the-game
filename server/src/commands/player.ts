import * as E from "fp-ts/lib/Either.js";
import { BuzzData, GameState, JoinGameData, Context, Game, Player } from "../types/types.js";

export function buzz(
  { player }: BuzzData,
  context: Context
): E.Either<string, string> {
  if (context.game.state !== GameState.ACCEPTING_BUZZEZ) {
    return E.left("not accepting buzzes");
  }

  context.game.buzzList.add(player);
  context.game.state = GameState.BUZZ_STOP;
  return E.right("ok");
}

export function joinGame(
  player: Player,
  game: Game
): E.Either<string, string> {
  const reserved = game.players.has(player);
  if (reserved) return E.left("username reserved");

  game.players.add(player);
  game.points.set(player, 0);

  return E.right("ok");
}
