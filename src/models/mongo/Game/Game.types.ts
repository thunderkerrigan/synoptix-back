import { Model } from "mongoose";
import { GameWordCloud, ShadowWordsCloud } from "../../Word";
import { DateTime } from "luxon";
export interface IGame {
  _id: number;
  title: string;
  date?: string;
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
  toObject: () => IGame;
  // checkPassword: (password: string) => Promise<boolean>
}
export interface IGameModel extends Model<IGameDocument> {
  clearDateForAllGames: () => Promise<void>;
  findARandomOne: () => Promise<IGameDocument>;
  findByDate: (date: DateTime) => Promise<IGameDocument | undefined>;
  findByDateBefore: (date: DateTime) => Promise<IGameDocument[] | undefined>;
  addFinderToGame: (userID: string, id: number) => Promise<void>;
}
