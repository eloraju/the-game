<script lang="ts">
 import {io} from 'socket.io-client';
 const socket = io("localhost:3000")

  socket.on("connection", () => {
    requests = [...requests, "Connected"]
    responses = [...responses, "Connected"]
  });

  socket.on("res", (data)=>{
    responses = [...responses, data]
  })

 let requests: string[] = [];
 let responses: string[] = [];

 function ping() {
 requests = [...requests, "ping"];
 socket.emit("req", "ping");
 }
 function joinGame() {
 const data = {cmd: "join", data: {gameId: "test", username: "testing"}};
 requests = [...requests, JSON.stringify(data)];
 socket.emit("req", data);
 }
</script>
<body>
<div style="display: flex; flex-direction: row; justify-content: start; flex-wrap: wrap; gap: 0.5em">
  <button on:click={ping}>send ping</button>
  <button on:click={joinGame}>join game</button>
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
