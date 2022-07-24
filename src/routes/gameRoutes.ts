import { Request, Response, Router } from "express";
import { DateTime } from "luxon";
import { getCurrentGame } from "../controllers/GameController";
import { makeRandomSentence } from "../controllers/RandomSentence";
import {
  RequestWinResponse,
  ScoreResponse,
  TypedRequestBody,
  TypedResponse,
} from "../models/Express";
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

router.get("/randomTeamName", async (req: Request, res: Response) => {
  try {
    const teamName = makeRandomSentence("f");
    res.send(teamName);
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
    res: TypedResponse<ScoreResponse>
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
      const { hasWon } = currentGame.checkWinningCondition(
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
router.post(
  "/registerWin/",
  async (
    req: TypedRequestBody<{
      userID: string;
      wordIDs: string[];
    }>,
    res: TypedResponse<RequestWinResponse>
  ) => {
    const currentGame = getCurrentGame();
    try {
      const { userID, wordIDs } = req.body;
      const candidateWordIDs: string[] = wordIDs.map((id) => id.toString());
      const { hasWon, position } = currentGame.checkWinningCondition(
        userID,
        candidateWordIDs
      );
      if (hasWon) {
        await GameModel.addFinderToGame(userID, currentGame._id);
      }
      return res.send({
        foundPosition: position,
        response: hasWon ? currentGame.solution : undefined,
      });
    } catch (error) {
      return res.send({
        foundPosition: -1,
        response: undefined,
      });
    }
  }
);

export default router;
