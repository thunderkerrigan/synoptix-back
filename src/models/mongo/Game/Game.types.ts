import { Model } from "mongoose";
import { GameWordCloud, ShadowWordsCloud } from "../../Word";
import { DateTime } from "luxon";
export interface IGame {
  _id: number;
  title: string;
  date?: String;
  foundByIDs: string[];
  solution: ShadowWordsCloud;
  solutionPlainText: string;
  wordCloud: GameWordCloud;
  redactedTitle: ShadowWordsCloud;
  redactedSynopsis: ShadowWordsCloud;
}
export interface IGameDocument extends IGame {
  // TODO: specific method on current object
  addDate: (date: DateTime) => Promise<void>;
  // checkPassword: (password: string) => Promise<boolean>
}
export interface IGameModel extends Model<IGameDocument> {
  findARandomOne: () => Promise<IGameDocument>;
  findByDate: (date: DateTime) => Promise<IGameDocument>;
  addFinderToGame: (userID: string, date: DateTime) => Promise<void>;
}
