import {Server} from 'socket.io';
import {createServer} from 'http';
import cors from 'cors';
import express from 'express';

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

io.on("connection", (socket)=> {
  console.log(`new client connected`);
  socket.emit("connection")
  socket.on("req", (request: any)=>{
    console.log(`Request: ${request}`)
    socket.emit("res", "ok");
  });
});
app.use(cors());
app.get("/", (_, res)=> {
  res.send(":)");
});
const port = 3000;

httpServer.listen(port, ()=> console.log(`Server listening on port ${port}`));
