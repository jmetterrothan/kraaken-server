const http = require("http");
const express = require("express");
const uuidv4 = require("uuid").v4;
const dotenv = require("dotenv");

const config = dotenv.config();

const api = require("./api");

const app = express();
app.use("/api", api);

const server = new http.Server(app);
const port = process.env.PORT || 10000;
const host = process.env.HOST || "0.0.0.0";

const rooms = new Map();

const io = require("socket.io")(server, {
  cors: { origin: "*" },
});

server.listen(port, host, () => {
  console.log(`Server listening on port ${port}`);
});

io.on("connection", (socket) => {
  const uuid = uuidv4();

  console.log(`Socket ${socket.id} connected`);

  socket.on("join_room", (roomId) => {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, []);
    }

    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user_joined_room", uuid);

    console.log(`Joined room ${roomId}`);
  });

  socket.on("sync_room", (roomId) => {
    const events = rooms.get(roomId);

    if (events) {
      events.forEach(({ type, event }) => {
        socket.emit(type, event);
      });
    }
  });

  socket.on("reset_room", (roomId) => {
    rooms.set(roomId, []);
  });

  socket.on("event", ({ roomId, event: { type, ...event } }) => {
    io.to(roomId).emit(type, event);

    const events = rooms.get(roomId);

    if (events) {
      events.push({ type, event });
    }
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((roomId) => {
      socket.to(roomId).broadcast.emit("user_left_room", uuid);
      // clean up when last user leaves
      if (io.sockets.adapter.rooms.get(roomId).size - 1 === 0) {
        rooms.delete(roomId);
      }
    });
  });

  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} disconnected`);
  });
});
