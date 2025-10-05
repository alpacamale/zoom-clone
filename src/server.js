import http from "http";
// import WebSocket from "ws";
import express from "express";
import { SocketIo, Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const port = 3000;

function publicRooms() {
  const {
    sockets: {
      adapter: { rooms, sids },
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

const app = express();
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.use((req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:${port}`);
const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

instrument(wsServer, {
  auth: false,
});

function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
  socket["nickname"] = "Annonymouse";
  socket.onAny((event) => {
    console.log(wsServer.sockets.adapter);
    console.log(`Socket event:`, event);
  });
  socket.on("enter_room", (roomName, showRoom) => {
    socket.join(roomName);
    showRoom();
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
    wsServer.sockets.emit("room_change", publicRooms());
  });
  socket.on("disconnecting", () => {
    console.log(socket.rooms);
    socket.rooms.forEach((room) => {
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1);
    });
    socket.on("disconnect", () => {
      wsServer.sockets.emit("room_change", publicRooms());
    });
  });
  socket.on("new_message", (msg, roomName, done) => {
    socket.to(roomName).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });
  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

// const wss = new WebSocket.Server({ server });
// const sockets = [];

// function onSocketClose() {
//   console.log("Disconnected from Browser ❌");
// }

// function onSocketMessage(msg) {
//   console.log(msg.toString("utf-8"));
//   const message = JSON.parse(msg);
//   switch (message.type) {
//     case "new_message":
//       sockets.forEach((s) => s.send(`${this.nickname}: ${message.payload}`));
//       break;
//     case "nickname":
//       this["nickname"] = message.payload;
//       break;
//   }
// }

// wss.on("connection", (socket) => {
//   sockets.push(socket);
//   socket["nickname"] = "Annonymouse";
//   console.log("Connected to Browser ✅");
//   socket.on("close", onSocketClose);
//   socket.on("message", onSocketMessage);
//   socket.send("hello!!");
// });

httpServer.listen(port, handleListen);
