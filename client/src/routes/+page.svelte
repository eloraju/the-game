<script lang="ts">
  import {client} from '$lib/stores/socketStore';

  function createGame(gameId: string) {
      client.createGame({gameId});
  }

  function joinGame(gameId: string, player: string) {
      client.joinGame({gameId, player});
  }

  let gameId: string;
  let player: string;
  $:createDisabled = !(Boolean(gameId) && gameId.length > 0);
  $:playerDisabled = !(Boolean(player) && player.length > 0);
  $:log = () => {
    console.log("gameId",createDisabled)
    console.log("player",playerDisabled)
    console.log(playerDisabled || createDisabled)
    return playerDisabled && createDisabled
  }
</script>

<div class="flex flex-col gap-5 items-center justify-center">
  <h1 class="text-xxl font-bold">THE GAME</h1>
  <input bind:value={gameId} class="input-md" type="text" name="gameId" id="gameId" placeholder="Game name">
  <input bind:value={player} class="input-md" type="text" name="player" id="player" placeholder="Player name">
  <button class="btn" disabled={createDisabled}>Create game</button>
  <button class="btn" disabled={playerDisabled || createDisabled}>Join game</button>
</div>