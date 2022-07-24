import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import { getCurrentGame } from "./GameController";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../models/Socket";
import { instrument } from "@socket.io/admin-ui";
import { makeRandomSentence } from "./RandomSentence";
import { randomWithRange } from "../utils/number+utils";

let io: Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
export const SocketServer = (server: HTTPServer) => {
  io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server, {
    cors: {
      origin: [process.env.SOCKET_ADMIN_URL, process.env.FRONT_END_URL],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  instrument(io, {
    auth: {
      username: process.env.SOCKET_ADMIN_USERNAME,
      password: process.env.SOCKET_ADMIN_PASSWORD,
      type: "basic",
    },
  });

  io.use(async (socket, next) => {
    if (!socket.data.username) {
      const gender: ["m", "f"] = ["m", "f"];
      const index = randomWithRange(0, gender.length);
      socket.data.username = makeRandomSentence(gender[index]);
    }
    next();
  });

  io.of("/").adapter.on("join-room", async (room, id) => {
    if (room !== id) {
      const users = await io.in(room).fetchSockets();
      io.to(room).emit("roomInfo", {
        _id: room,
        roomName: room,
        isPublic: true,
        users: users.map((u) => u.data.username as string),
      });
    }
  });
  io.of("/").adapter.on("leave-room", async (room, id) => {
    if (room !== id) {
      const users = await io.in(room).fetchSockets();
      io.to(room).emit("roomInfo", {
        _id: room,
        roomName: room,
        isPublic: true,
        users: users.map((u) => u.data.username as string),
      });
    }
  });

  io.on("connection", async (socket) => {
    socket.on("joinRoom", async (roomID, ack) => {
      try {
        if (!roomID) {
          throw new Error("Room not found");
        }
        const rooms = [...socket.rooms].filter(
          (r) => r !== socket.id && r !== roomID
        );
        for (const room of rooms) {
          // leave previous rooms if any
          socket.leave(room);
        }
        // join room
        socket.join(roomID);
        socket.data.connectedRoom = roomID;
        //  acknowledge the room join
        ack(undefined, roomID);
        // notify the room of the new user
        socket.to(roomID).emit("newPlayerInRoom");
      } catch (error) {
        ack(error.message);
      }
    });

    socket.on("leaveRoom", async (ack) => {
      try {
        const rooms = [...socket.rooms].filter((r) => r !== socket.id);
        for (const room of rooms) {
          // leave all rooms if any
          socket.leave(room);
        }
        socket.data.connectedRoom = undefined;
        ack(undefined, "left room");
      } catch (error) {
        ack(error.message);
      }
    });

    socket.on("sendWordsToRoom", (gameID, words) => {
      if (socket.data.connectedRoom && gameID === getCurrentGame()._id) {
        socket.to(socket.data.connectedRoom).emit("shareWords", words);
      }
    });
    socket.on("sendLastWordsToRoom", (gameID, words) => {
      if (socket.data.connectedRoom && gameID === getCurrentGame()._id) {
        socket.to(socket.data.connectedRoom).emit("shareLastWords", words);
      }
    });
  });

  return io;
};
