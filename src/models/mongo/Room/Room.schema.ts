import { Schema } from "mongoose";
import { makeRandomSentence } from "../../../controllers/RandomSentence";
import { IRoomDocument } from "./Room.types";

const RoomSchema = new Schema<IRoomDocument>({
  _id: { type: String, required: true },
  isPublic: { type: Boolean, required: true },
  roomName: { type: String, required: true },
  users: { type: [String], required: true },
});

// methods
RoomSchema.methods.replaceRoomName = async function (roomName: string) {
  this.roomName = roomName;
  await this.save();
};
RoomSchema.methods.addUSer = async function (userID: string) {
  if (this.users.includes(userID)) {
    return false;
  }
  this.users.push(userID);
  await this.save();
};
RoomSchema.methods.removeUser = async function (userID: string) {
  if (this.users.includes(userID)) {
    return false;
  }
  this.users = this.users.filter((user: string) => user !== userID);
  await this.save();
};

// static methods
RoomSchema.statics.findOneContainingUser = function (
  userID: string
): Promise<IRoomDocument | undefined> {
  return this.findOne().where("users").equals(userID).lean();
};

RoomSchema.statics.createRoom = async function (roomID: string, user: string) {
  const room = new this({
    _id: roomID,
    roomName: makeRandomSentence("p"),
    users: [user],
  });
  await room.save();
};
RoomSchema.statics.deleteRoom = async function (roomID: string) {
  await this.deleteOne({ _id: roomID });
};
RoomSchema.statics.resetRooms = async function () {
  await this.deleteMany({ _id: { $exists: true } });
};

export default RoomSchema;
