import { Schema } from "mongoose";
import { IWordDocument } from "./Word.types";

const WordSchema = new Schema<IWordDocument>({
  value: { type: String, required: true },
  linkedWord: { type: [String], required: true },
});

WordSchema.statics.findOneContaining = function (
  word: string
): Promise<IWordDocument | undefined> {
  return this.findOne().where("value").equals(word).lean();
};

export default WordSchema;
