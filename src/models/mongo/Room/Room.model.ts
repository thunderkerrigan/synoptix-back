import { model } from "mongoose";
import { IRoomDocument, IRoomModel } from "./Room.types";
import RoomSchema from "./Room.schema";

export const RoomModel = model<IRoomDocument, IRoomModel>("Room", RoomSchema);
