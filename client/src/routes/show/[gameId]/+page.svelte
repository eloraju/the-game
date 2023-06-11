<script lang="ts">
	import { client, gameData, points } from "$lib/stores/socketStore";
	import type { Game, PointsData } from "server/src/types/types";
 
    export let data;
    let pointsList: PointsData[]
    let game: Game;

    gameData.subscribe(data => game = data)
    points.subscribe(data => pointsList = data)
    client.getGame(data.gameId)

</script>

{#if game !== undefined}
{#each pointsList as {player, points}}
    {player}
{/each}
    players found :)
{:else}
    No game for you
{/if}