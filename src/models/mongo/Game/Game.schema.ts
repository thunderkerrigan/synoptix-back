import { Schema } from "mongoose";
import { IGameDocument } from "./Game.types";
import { DateTime } from "luxon";
import { randomWithRange } from "../../../utils/number+utils";

const GameWordCloudSchema = new Schema(
  {
    allWordsCloud: {
      type: Schema.Types.Mixed,
    },
    singleLetterCloud: {
      type: Schema.Types.Mixed,
    },
    numberCloud: {
      type: Schema.Types.Mixed,
    },
    wordCloud: {
      type: Schema.Types.Mixed,
    },
  },
  { minimize: false }
);

const GameSchema = new Schema<IGameDocument>({
  _id: { type: Number, required: true },
  date: { type: String, required: false },
  title: { type: String, required: true },
  foundByIDs: { type: [String], required: true },
  redactedTitle: {
    type: Schema.Types.Mixed,
    required: true,
  },
  redactedSynopsis: {
    type: Schema.Types.Mixed,
    required: true,
  },
  solution: {
    type: Schema.Types.Mixed,
    required: true,
  },
  solutionPlainText: { type: String, required: true },
  wordCloud: { type: GameWordCloudSchema, required: true },
});

GameSchema.methods.addDate = async function (date: DateTime) {
  this.date = date.toISODate();
  await this.save();
};

GameSchema.statics.findByDate = async function (date: DateTime) {
  const game = await this.findOne({ date: date.toISODate() });
  return game;
};
GameSchema.statics.findByDateBefore = async function (date: DateTime) {
  const game = await this.find({
    $and: [{ date: { $exists: true } }, { date: { $ne: date.toISODate() } }],
  });
  return game;
};

GameSchema.statics.addFinderToGame = async function (
  userID: string,
  id: number
) {
  const game = await this.findById(id);
  if (game && !game.foundByIDs.includes(userID)) {
    game.foundByIDs.push(userID);
    await game.save();
  }
};
GameSchema.statics.clearDateForAllGames = async function () {
  await this.updateMany({ date: { $exists: true } }, { $unset: { date: "" } });
};
GameSchema.statics.findARandomOne = async function () {
  const games = await this.find({
    date: { $exists: false },
  });
  const index = randomWithRange(0, games.length);
  return games[index];
};

export default GameSchema;
