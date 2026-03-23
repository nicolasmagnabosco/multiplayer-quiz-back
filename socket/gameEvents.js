import { getRoom } from "./utils.js";

export const gameEvents = (io, socket) => {
  const showQuestion = () => {
    socket.on("showQuestion", (question) => {
      socket.to(socket.currentRoom).emit("displayQuestion", question);
    });
  };

  const turnExpired = () => {
    socket.on("turnExpired", () => {
      const thisRoom = getRoom(socket.currentRoom);
      if (!thisRoom) return;

      // get other player id
      const otherPlayerId = Object.keys(thisRoom.players).find(
        (id) => id !== socket.id,
      );

      thisRoom.turn = otherPlayerId;

      io.to(socket.currentRoom).emit("solution", false, thisRoom);
    });
  };

  const validateAnswer = (questions) => {
    socket.on("validateAnswer", (question, answer, diceValue) => {
      const thisRoom = getRoom(socket.currentRoom);
      if (!thisRoom || socket.id !== thisRoom.turn) {
        console.log("error de turno");
        return;
      }

      const player = thisRoom.players[socket.id];

      // get other player id
      const otherPlayerId = Object.keys(thisRoom.players).find(
        (id) => id !== socket.id,
      );

      console.log("validating...", otherPlayerId);
      thisRoom.turn = otherPlayerId;

      const q = questions.find((q) => q.question === question);

      if (q && q.answer === answer) {
        if (player) {
          const newPos = player.position + diceValue;
          player.score += 1;
          if (newPos >= 19) {
            player.position = 19;
            thisRoom.winner = socket.id;
          } else player.position = newPos;
          io.to(socket.currentRoom).emit("correctAnswer", socket.id, thisRoom);
        }
      } else io.to(socket.currentRoom).emit("wrongAnswer", socket.id, thisRoom);
    });
  };

  return {
    showQuestion,
    turnExpired,
    validateAnswer,
  };
};
