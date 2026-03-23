import { rooms } from "./roomSocket.js";
import { io } from "../index.js";

export const getRoom = (roomId) => {
  return rooms[roomId];
};

export const getSocketRoom = (roomId) => io.sockets.adapter.rooms.get(roomId);

export const createRoom = (playerId, roomId, questions) => {
  rooms[roomId] = {
    board: questions
      .sort(() => Math.random() - 0.5)
      .map((q) => ({ question: q.question, options: q.options })),
    winner: null,
    players: {},
    turn: playerId,
    turnDuration: 20, //seconds
  };
};

export const onLeaveRoom = (socket) => {
  const room = getRoom(socket.currentRoom);
  if (!room) return;

  const otherPlayerId = Object.keys(room.players).find(
    (id) => id !== socket.id,
  );
  room.winner = otherPlayerId;

  if (!room.winner) socket.to(socket.currentRoom).emit("playerLeft", room);

  delete room.players[socket.id];
  socket.leave(socket.currentRoom);

  socket.currentRoom = null;
};
