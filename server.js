const http = require("http");
const express = require("express");
const uuidv4 = require("uuid").v4;

const api = require("./api");

const app = express();
app.use("/api", api);

const server = new http.Server(app);
const port = process.env.PORT || 4200;

const io = require("socket.io")(server, {
  cors: { origin: "*" },
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

io.on("connection", (socket) => {
  const uuid = uuidv4();

  console.log(`Socket ${socket.id} connected`);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user_joined_room", uuid);

    console.log(`Joined room ${roomId}`);
  });

  socket.on("event", ({ roomId, event: { type, ...event } }) => {
    io.to(roomId).emit(type, event);
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((roomId) => {
      socket.to(roomId).broadcast.emit("user_left_room", uuid);
    });
  });

  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} disconnected`);
  });
});
