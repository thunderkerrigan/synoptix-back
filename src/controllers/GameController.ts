import { DateTime } from "luxon";
import { Game } from "../models/Game";
import { GameModel } from "../models/mongo/Game/Game.model";
import { RecurrenceRule, scheduleJob } from "node-schedule";

const rule = new RecurrenceRule();
rule.hour = 0;
rule.minute = 0;
rule.second = 1;
const autoRefreshGameSchedule = scheduleJob(
  "auto refresh game",
  rule,
  async () => {
    currentGame = await getGame();
    console.log("new game begin!");
  }
);

export const loadGame = async () => {
  currentGame = await getGame();
  console.log("game loaded");
};

let currentGame: Game = undefined;

export const getCurrentGame = () => currentGame;

const getGame = async () => {
  try {
    const todayISODate = DateTime.now();
    if (currentGame && currentGame.date === todayISODate.toISODate()) {
      return currentGame;
    }
    const existingGame = await GameModel.findByDate(todayISODate);
    const dayNumber = await GameModel.countDocuments({
      date: { $exists: true },
    });
    const lastMovie = await GameModel.findByDate(
      todayISODate.minus({ days: 1 })
    );
    if (existingGame) {
      const plainExistingGame = existingGame.toObject();

      currentGame = new Game({
        ...plainExistingGame,
        dayNumber,
        lastMovie: lastMovie ? lastMovie.title : "",
      });
      return currentGame;
    }
    const newGame = await GameModel.findARandomOne();
    if (newGame) {
      await newGame.addDate(DateTime.now());
      const plainNewGame = newGame.toObject();
      currentGame = new Game({
        ...plainNewGame,
        dayNumber: dayNumber + 1,
        lastMovie: lastMovie ? lastMovie.title : "",
      });
      return currentGame;
    }
  } catch (error) {
    console.log(error);
  }
};
