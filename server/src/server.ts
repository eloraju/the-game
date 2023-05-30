import {Server, Socket} from 'socket.io';
import {createServer} from 'http';
import express from 'express';
import { handleRequest } from './gameHandler.js';
//@ts-ignore
import { handler } from 'client/build/handler.js';
import { Response, RpcCommand } from './types/types';
import { match } from 'fp-ts/lib/Either.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
      methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

const connections = new Map<string, Socket>();

io.on("connection", (socket)=> {
  console.log(`new client connected`);
  socket.emit("connection", socket.id)
  connections.set(socket.id, socket);
  socket.on("req", (request)=>{
    console.log(`Request: ${request}`)
    const cmd = JSON.parse(request) as RpcCommand;
    const data = handleRequest(cmd, socket.id, connections);
    // well this is ugly... must get to ipmlementing fp-ts at some point....
    let response: Response = match(
      (error)=>({ack: cmd.ack, data: error, err:true}),
      (result)=>({ack: cmd.ack, data: result, err: false})
      )(data)

    console.log("Response:", JSON.stringify(response))
    socket.emit("res", JSON.stringify(response))
  });
});
app.use(handler);
const port = 3000;

httpServer.listen(port, ()=> console.log(`Server listening on port ${port}`));
