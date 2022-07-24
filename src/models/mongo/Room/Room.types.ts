import { Model } from "mongoose";
export interface IRoom {
  _id: string;
  isPublic: boolean;
  roomName: string;
  users: string[];
}
export interface IRoomDocument extends IRoom {
  replaceRoomName: (roomName: string) => Promise<boolean>;
  addUSer: (userID: string) => Promise<boolean>;
  removeUser: (userID: string) => Promise<boolean>;
}
export interface IRoomModel extends Model<IRoomDocument> {
  createRoom: (roomID: string) => Promise<boolean>;
  resetRooms: (roomID: string) => Promise<boolean>;
  deleteRoom: (roomID: string) => Promise<boolean>;
  findOneContainingUser: (userID: string) => Promise<IRoomDocument | undefined>;
}
