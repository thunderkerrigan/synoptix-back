import { Model } from "mongoose";
import { WordType } from "../../Word";
export interface IWord {
  value: string;
  linkedWord: string[];
}
export interface IWordDocument extends IWord {
  // TODO: specific method on current object
  // setPassword: (password: string) => Promise<void>
  // checkPassword: (password: string) => Promise<boolean>
}
export interface IWordModel extends Model<IWordDocument> {
  findOneContaining: (word: string) => Promise<IWordDocument | undefined>;
}
