<script lang="ts">
import {requests, responses, client } from '$lib/stores/socketStore';

let requestsAr: string[] = [];
let responsesAr: string[] = [];

requests.subscribe(up => requestsAr = up);
responses.subscribe(up => responsesAr = up);

function joinGame() {
  client.joinGame({gameId: "test", player: "testing"});
}

function createGameClick() {
  client.createGame({
    gameId: "test"
  });
}
</script>

<body>
<div style="display: flex; flex-direction: row; justify-content: start; flex-wrap: wrap; gap: 0.5em">
  <button on:click={client.ping}>send ping</button>
  <button on:click={joinGame}>join game</button>
  <button on:click={createGameClick}>create game</button>
</div>
<div style="display: flex; flex-direction: row; justify-content: space-evenly;">
  <div>
  <h2>REQUESTS</h2>
    {#each requestsAr as request}
      <code>{request}</code><br>
    {/each}
  </div>
  <div>
  <h2>RESPONSES</h2>
    {#each responsesAr as response}
      <code>{response}</code><br>
    {/each}
  </div>
</div>
</body>
