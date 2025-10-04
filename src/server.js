import http from "http";
import WebSocket from "ws";
import express from "express";

const port = 3000;

const app = express();
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.use((req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:${port}`);
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const sockets = [];

function onSocketClose() {
  console.log("Disconnected from Browser ❌");
}

function onSocketMessage(msg) {
  console.log(msg.toString("utf-8"));
  const message = JSON.parse(msg);
  switch (message.type) {
    case "new_message":
      sockets.forEach((s) => s.send(`${this.nickname}: ${message.payload}`));
      break;
    case "nickname":
      this["nickname"] = message.payload;
      break;
  }
}

wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "Annonymouse";
  console.log("Connected to Browser ✅");
  socket.on("close", onSocketClose);
  socket.on("message", onSocketMessage);
  socket.send("hello!!");
});

server.listen(port, handleListen);
