import { IRoom } from "./mongo/Room/Room.types";
import { LastWord, ShadowWord } from "./Word";

export interface ServerToClientEvents {
  // noArg: () => void;
  // basicEmit: (a: number, b: string, c: Buffer) => void;
  // withAck: (d: string, callback: (e: number) => void) => void;
  newPlayerInRoom: () => void;
  roomInfo: (room: IRoom) => void;
  shareWords: (words: ShadowWord[]) => void;
  shareLastWords: (words: LastWord[]) => void;
  publicRooms: (rooms: IRoom[]) => void;
}

export interface ClientToServerEvents {
  joinRoom: (
    roomID: string,
    ack: (error?: string, response?: string) => void
  ) => void;
  leaveRoom: (ack: (error?: string, response?: string) => void) => void;
  sendWordsToRoom: (gameID: number, words: ShadowWord[]) => void;
  sendLastWordsToRoom: (gameID: number, words: LastWord[]) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userID: string;
  username: string;
  connectedRoom: string;
}
