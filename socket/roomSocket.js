import { gameEvents } from "./gameEvents.js";
import { playerEvents } from "./playerEvents.js";

//mockup rooms to store data about games. indexed by room id, matching the Socket.IO rooms.
export const rooms = {};

export const setUpRoomSocket = (io, questions) => {
  io.on("connection", (socket) => {
    const player = playerEvents(io, socket, rooms);
    const game = gameEvents(io, socket, rooms);
    console.log("Bienvenido " + socket.id);
    player.joinRoom(questions); //jugador se una a una sala
    player.ready(); //dentro de una sala, jugador indica que esta listo para jugar
    player.leaveRoom(); //jugador sale de una sala
    player.disconnect(); //jugador se desconecta del servidor
    game.showQuestion(); //jugador envia la pregunta que tiene que responder para que el otro jugador la vea
    game.turnExpired(); //se acabó el timpo del turno
    game.validateAnswer(questions); //jugador envía su respuesta y es validada por el servidor
  });
};
