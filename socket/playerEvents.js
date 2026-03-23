// import { createRoom, getRoom, getSocketRoom, onLeaveRoom } from "./utils.js";

// export const playerEvents = (io, socket) => {
//   //player.join()
//   const joinRoom = (questions) => {
//     socket.on("joinRoom", (roomId) => {
//       const socketRoom = getSocketRoom(roomId);
//       if (socketRoom && socketRoom.size === 2) socket.emit("fullRoom", roomId);
//       else {
//         if (!socketRoom) createRoom(socket.id, roomId, questions); //creates the local mockup of the room
//         const thisRoom = getRoom(roomId);
//         console.log(thisRoom);
//         thisRoom.players["socket.id"] = {
//           position: 0,
//           score: 0,
//           isReady: false,
//         }
//         socket.currentRoom = roomId;
//         socket.join(roomId); //creates the Socket.IO room by joining the first player automatically
//         socket.emit("joined", thisRoom);
//         socket.to(roomId).emit("playerJoined", socket.id);
//       }
//     });
//   };

//   //player.ready()
//   const ready = () => {
//     socket.on("ready", () => {
//       if (socket.currentRoom) {
//         const thisRoom = getRoom(socket.currentRoom);
//         const player = thisRoom.players.get(socket.id);
//         if (player && !player.isReady) {
//           player.isReady = true;
//           const socketRoom = getSocketRoom(socket.currentRoom);
//           if (
//             socketRoom && // socket.io room exists
//             thisRoom && // local room exists
//             thisRoom.players.size === 2 &&
//             [...thisRoom.players.values()].every((p) => p.isReady)
//           )
//             io.to(socket.currentRoom).emit("startGame", thisRoom);
//           else socket.emit("isNowReady");
//         }
//       }
//     });
//   };

//   //player.leave()
//   const leaveRoom = () => {
//     socket.on("leave", () => {
//       onLeaveRoom(socket);
//     });
//   };

//   //player.disconnect()
//   const disconnect = () => {
//     socket.on("disconnect", () => {
//       if (socket.currentRoom) onLeaveRoom(socket);
//       console.log("bye bye " + socket.id);
//     });
//   };

//   return {
//     joinRoom,
//     ready,
//     leaveRoom,
//     disconnect,
//   };
// };

import { createRoom, getRoom, getSocketRoom, onLeaveRoom } from "./utils.js";

export const playerEvents = (io, socket) => {
  // player.join()
  const joinRoom = (questions) => {
    socket.on("joinRoom", (roomId) => {
      const socketRoom = getSocketRoom(roomId);

      if (socketRoom && socketRoom.size === 2) {
        socket.emit("fullRoom", roomId);
        return;
      }

      if (!socketRoom) {
        createRoom(socket.id, roomId, questions);
      }

      const thisRoom = getRoom(roomId);
      if (!thisRoom) return;

      thisRoom.players[socket.id] = {
        position: 0,
        score: 0,
        isReady: false,
      };

      socket.currentRoom = roomId;
      socket.join(roomId);

      socket.emit("joined", thisRoom);
      socket.to(roomId).emit("playerJoined", socket.id);
    });
  };

  // player.ready()
  const ready = () => {
    socket.on("ready", () => {
      if (!socket.currentRoom) return;

      const thisRoom = getRoom(socket.currentRoom);
      if (!thisRoom) return;

      const player = thisRoom.players[socket.id];
      if (!player || player.isReady) return;

      player.isReady = true;

      const socketRoom = getSocketRoom(socket.currentRoom);

      const playerIds = Object.keys(thisRoom.players);
      const allReady =
        playerIds.length === 2 &&
        playerIds.every((id) => thisRoom.players[id].isReady);

      if (socketRoom && allReady) {
        io.to(socket.currentRoom).emit("startGame", thisRoom);
      } else {
        socket.emit("isNowReady");
      }
    });
  };

  // player.leave()
  const leaveRoom = () => {
    socket.on("leave", () => {
      onLeaveRoom(socket);
    });
  };

  // player.disconnect()
  const disconnect = () => {
    socket.on("disconnect", () => {
      if (socket.currentRoom) {
        onLeaveRoom(socket);
      }
      console.log("bye bye " + socket.id);
    });
  };

  return {
    joinRoom,
    ready,
    leaveRoom,
    disconnect,
  };
};
