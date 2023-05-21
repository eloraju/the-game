import {Server, Socket} from 'socket.io';
import {createServer} from 'http';
import cors from 'cors';
import express from 'express';
import { handleRequest } from './gameHandler.js';
//@ts-ignore
import { handler } from 'client/build/handler.js';
import { RpcCommand } from './types/types';

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
    cmd.connections = connections;
    cmd.socketId = socket.id;
    socket.emit("res", JSON.stringify(handleRequest(cmd)));
  });
});
app.use(handler);
const port = 3000;

httpServer.listen(port, ()=> console.log(`Server listening on port ${port}`));
