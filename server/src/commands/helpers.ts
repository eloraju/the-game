import { Command, Game, UpdateForUI, PointsData } from "../types/types";

export function playerIsInGame(
  gameId: string,
  playerId: string,
  games: Map<string, Game>
): boolean {
  const game = games.get(gameId);
  return Boolean(game) && game!.players.has(playerId);
}

export function getSortedPoints(game: Game): PointsData[] {
  return Array.from(game.points)
    .map(([player, points]) => ({ player, points }))
    .sort((a, b) => b.points - a.points);
}

export function getUpdateData(games: Map<string, Game>, gameId: string, cmd: Command): string {
  const game = games.get(gameId);
  if(!game) throw new Error("Yolo swaggings");

  const res: UpdateForUI = {
    gameId,
    state: game.state,
    buzzList: Array.from(game.buzzList),
    players: Array.from(game.players),
    points: getSortedPoints(game),
    cmd
  }
  return JSON.stringify(res)
}
