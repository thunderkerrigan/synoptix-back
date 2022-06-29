import { model } from "mongoose";
import { IGameDocument, IGameModel } from "./Game.types";
import GameSchema from "./Game.schema";

export const WordModel = model<IGameDocument, IGameModel>("Game", GameSchema);
