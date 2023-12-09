import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import ACTIONS from "./src/Actions.js";

const app = express();
const PORT = 4000;

const server = createServer(app);
const io = new Server(server);

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

  //recieving code from client and sending to client
  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code }); //send to every client  except me
  });
  //recieving code from client and sending to client
  socket.on(ACTIONS.SYNC_Code, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code }); //send to every client  except me
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
