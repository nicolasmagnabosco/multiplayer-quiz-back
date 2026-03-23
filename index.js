import express from "express";
import "dotenv/config";
import { Server } from "socket.io";
import http from "http";
import questions from "./questions.json" with { type: "json" };
import { setUpRoomSocket } from "./socket/roomSocket.js";

const PORT = process.env.API_PORT || 3000;
const app = express();
const server = http.createServer(app);
const CLIENT_URLS = [
  process.env.CLIENT_LOCAL_URL,
  process.env.CLIENT_NETWORK_URL,
];

export const io = new Server(server, { cors: { origin: CLIENT_URLS } });

app.get("/questions", (req, res) => {
  res.json(
    questions.map((q) => ({ question: q.question, options: q.options })),
  );
});

setUpRoomSocket(io, questions);

server.listen(PORT, () => {
  console.log("Server running...");
});
