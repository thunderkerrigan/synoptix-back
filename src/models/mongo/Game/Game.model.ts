import { model } from "mongoose";
import { IGameDocument, IGameModel } from "./Game.types";
import GameSchema from "./Game.schema";

export const GameModel = model<IGameDocument, IGameModel>("Game", GameSchema);
