import { BuzzEvent, Context, Event } from "./types/types.js";
import { getSortedPoints } from "./commands/helpers.js";

export function sendJoinEventToAdmin({ adminSocket, game }: Context) {
  adminSocket.emit(
    "event",
    JSON.stringify({ data: getSortedPoints(game), event: Event.PLAYER_JOIN })
  );
}

export function sendBuzzEventToAdmin({ game, adminSocket }: Context) {
  const buzzEvent: BuzzEvent = {
    event: Event.BUZZ,
    data: Array.from(game.buzzList),
  };
  adminSocket.emit("event", JSON.stringify(buzzEvent));
}
