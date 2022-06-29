import { Schema } from "mongoose";
import { IGameDocument } from "./Game.types";

const WordSchema = new Schema<IGameDocument>({
  value: { type: String, required: true },
  linkedWord: { type: [String], required: true },
});

// WordSchema.statics.findOneContaining = function (
//   word: string
// ): Promise<IGameDocument> {
//   return this.findOne().where("value").equals(word).lean();
// };

export default WordSchema;
