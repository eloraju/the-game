import { Game, PointsData } from "../types/types";

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
