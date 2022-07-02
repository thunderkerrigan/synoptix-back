import { Request, Response, Router } from "express";
import { DateTime } from "luxon";
import { TypedRequestBody } from "../models/Express";
import { Game } from "../models/Game";
import { GameModel } from "../models/mongo/Game/Game.model";
import { compareWordWithCloud } from "../utils/vectorComparator";
const router = Router();

let currentGame: Game;

const getGame = async () => {
  const todayISODate = DateTime.now();
  if (currentGame && currentGame.date === todayISODate.toISODate()) {
    return currentGame;
  }
  const existingGame = await GameModel.findByDate(todayISODate);
  if (existingGame) {
    currentGame = new Game(existingGame);
    return currentGame;
  }
  const newGame = await GameModel.findARandomOne();
  if (newGame) {
    await newGame.addDate(DateTime.now());
    currentGame = new Game(newGame);
    return currentGame;
  }
};

router.get("/", async (req: Request, res: Response) => {
  try {
    const _game = await getGame();
    res.send(_game.redactedGame());
  } catch (error) {
    res.status(500).send(error);
  }
});
router.get("/status", async (req: Request, res: Response) => {
  try {
    const _game = await getGame();
    res.send(_game.redactedGame());
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post(
  "/score/",
  async (
    req: TypedRequestBody<{
      userID: string;
      word: string;
      wordIDs: string[];
    }>,
    res: Response
  ) => {
    try {
      const { userID, word, wordIDs } = req.body;
      // console.log('score', userID, word)
      const { score, cache: updatedCache } = await compareWordWithCloud(
        word,
        currentGame.wordCloud,
        currentGame.cache
      );

      const scoreIDs = score
        .filter((word) => word.similarity === 1)
        .map((word) => word.id.toString());
      const candidateWordIDs: string[] = [
        ...wordIDs.map((id) => id.toString()),
        ...scoreIDs,
      ];
      const hasWon = currentGame.checkWinningCondition(
        userID,
        candidateWordIDs
      );
      currentGame.cache = updatedCache;
      if (hasWon) {
        await GameModel.addFinderToGame(userID, currentGame._id);
      }
      return res.send({
        score,
        foundBy: currentGame.foundBy,
        response: hasWon ? currentGame.solution : undefined,
      });
    } catch (error) {
      return res.send({
        score: [],
        foundBy: currentGame.foundBy,
        response: undefined,
      });
    }
  }
);

export default router;
