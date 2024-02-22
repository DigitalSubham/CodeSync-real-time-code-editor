import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import ACTIONS from "./src/Actions.js";
import "dotenv/config";
import path from "path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const app = express();
const PORT = process.env.VITE_PORT || 4000;

const server = createServer(app);
const io = new Server(server);

app.use(express.static("dist"));
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

function getAllConnectedClient(roomId) {
  // console.log(io.sockets.adapter.rooms.get(roomId) || []);
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        userName: userSocketMap[socketId],
      };
    }
  ); //getting data from socket in Map data structure and we convert that into array
}

const userSocketMap = {};

io.on("connection", (socket) => {
  // console.log("socket connection", socket.id);
  socket.on(ACTIONS.JOIN, ({ roomId, userName }) => {
    userSocketMap[socket.id] = userName;
    socket.join(roomId);
    const clients = getAllConnectedClient(roomId);
    // console.log(clients);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        userName,
        socketId: socket.id,
      });
    });
  });

  // Sending code changes to everyone except the sender
  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    // Broadcasting the received code to all clients in the specified room except the sender
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    // Note: 'socket.in(roomId)' targets all sockets in the room except the sender ('socket')
  });

  // Sending code changes to a specific client
  socket.on(ACTIONS.SYNC_Code, ({ socketId, code }) => {
    // Sending the received code to a specific client identified by socketId
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    // Note: 'io.to(socketId)' targets the socket with the specified socketId
  });

  // Sending output changes to everyone in the room, including the sender
  socket.on(ACTIONS.SYNC_OUTPUT, ({ roomId, output }) => {
    // Broadcasting the received output to all clients in the specified room
    io.to(roomId).emit(ACTIONS.SYNC_OUTPUT, { output });
    // Note: 'io.to(roomId)' targets all sockets in the specified room, including the sender
  });

  //agar client browser band ya kisi or page pe chala jata h to ye event trigger ho jata h
  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        userName: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
    socket.leave();
  });
});

server.listen(PORT, () => {
  console.log("server started at port", PORT);
});
