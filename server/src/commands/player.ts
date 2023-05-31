import * as E from "fp-ts/lib/Either.js";
import { BuzzData, GameState, JoinGameData, Context } from "../types/types.js";
import { sendBuzzEventToAdmin, sendJoinEventToAdmin } from "../eventsHandler.js";

export function buzz(
  { player }: BuzzData,
  context: Context
): E.Either<string, string> {
  if (context.game.state !== GameState.IN_PROGRESS) {
    return E.left("not accepting buzzes");
  }

  context.game.buzzList.add(player);
  sendBuzzEventToAdmin(context);
  return E.right("ok");
}

export function joinGame(
  { player }: JoinGameData,
  context: Context
): E.Either<string, string> {
  const reserved = context.game.players.has(player);
  if (reserved) return E.left("username reserved");

  context.game.players.add(player);
  context.game.points.set(player, 0);

  sendJoinEventToAdmin(context);

  return E.right("ok");
}
