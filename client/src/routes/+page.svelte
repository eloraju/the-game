<script lang="ts">
import {io} from 'socket.io-client';
import {Command} from 'server/src/types/types.js'
import { createGame } from '$lib/socketCommands';
const socket = io("localhost:3000")

socket.on("connection", (id) => {
    requests = [...requests, "Connected"]
    responses = [...responses, `Connected ${id}`]
    });

socket.on("res", (data)=>{
    responses = [...responses, data]
    })

let requests: string[] = [];
let responses: string[] = [];

function emitMessage(msg: any) {
  requests = [...requests, JSON.stringify(msg)];
  socket.emit("req", JSON.stringify(msg));
}

function ping() {
  emitMessage({cmd: Command.PING});
}
function joinGame() {
  const data = {cmd: Command.JOIN_GAME, data: {gameId: "test", username: "testing"}};
  emitMessage(data);
}

function createGameClick() {
  createGame({
    gameId: "test"
  },socket);
}
</script>

<body>
<div style="display: flex; flex-direction: row; justify-content: start; flex-wrap: wrap; gap: 0.5em">
  <button on:click={ping}>send ping</button>
  <button on:click={joinGame}>join game</button>
  <button on:click={createGameClick}>create game</button>
</div>
<div style="display: flex; flex-direction: row; justify-content: space-evenly;">
  <div>
  <h2>REQUESTS</h2>
    {#each requests as request}
      <code>{request}</code><br>
    {/each}
  </div>
  <div>
  <h2>RESPONSES</h2>
    {#each responses as response}
      <code>{response}</code><br>
    {/each}
  </div>
</div>
</body>
