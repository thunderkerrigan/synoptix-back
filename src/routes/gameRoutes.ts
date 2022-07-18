import { Request, Response, Router } from "express";
import { DateTime } from "luxon";
import { getCurrentGame } from "../controllers/GameController";
import { TypedRequestBody } from "../models/Express";
import { GameModel } from "../models/mongo/Game/Game.model";
import { compareWordWithCloud } from "../utils/vectorComparator";
const router = Router();

router.get("/stats", async (req: Request, res: Response) => {
  try {
    const _games = await GameModel.findByDateBefore(DateTime.now());
    res.send(
      _games
        .map((g) => ({ title: g.title, date: g.date }))
        .sort((a, b) =>
          DateTime.fromISO(a.date).diff(DateTime.fromISO(b.date)).toMillis()
        )
    );
  } catch (error) {
    res.status(500).send(error);
  }
});
router.get("/", async (req: Request, res: Response) => {
  try {
    const _game = getCurrentGame();
    res.send(_game.redactedGame());
  } catch (error) {
    res.status(500).send(error);
  }
});
router.get("/status", async (req: Request, res: Response) => {
  try {
    const _game = getCurrentGame();
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
    const currentGame = getCurrentGame();
    try {
      const { userID, word, wordIDs } = req.body;
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
