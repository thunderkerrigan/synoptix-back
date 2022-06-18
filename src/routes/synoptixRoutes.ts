import { Request, Response, Router } from "express";
import {
  findAllFormsForWord,
  findNewMovie,
} from "../controllers/SynoptixController";
import { TypedRequestBody } from "../models/Express";
import { Game } from "../models/Game";
import { ShadowWord } from "../models/Word";
import { compareWordWithCloud } from "../utils/vectorComparator";
const router = Router();

let currentGame: Game;

router.get("/", async (req: Request, res: Response) => {
  try {
    res.send(currentGame.redactedGame());
  } catch (error) {
    res.status(500).send(error);
  }
});
router.get("/backend/response", async (req: Request, res: Response) => {
  try {
    res.send(currentGame.title + currentGame.solutionPlainText);
  } catch (error) {
    res.status(500).send(error);
  }
});
router.get("/backend/:movie", async (req: Request, res: Response) => {
  try {
    const { movie } = req.params;
    const { id, title, synopsis } = await findNewMovie(movie);
    if (!currentGame || currentGame.id !== id) {
      currentGame = new Game(id, title, synopsis);
    }
    res.send(currentGame);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post(
  "/score/",
  async (
    req: TypedRequestBody<{ word: string; wordIDs: string[] }>,
    res: Response
  ) => {
    const { word, wordIDs } = req.body;
    console.log(word, wordIDs);

    const score = await compareWordWithCloud(word, currentGame.wordCloud);
    const candidateWordIDs = [...wordIDs, ...score.map((x) => x.id.toString())];
    currentGame.checkWinningCondition(candidateWordIDs);
    return res.send({ score, foundBy: currentGame.foundBy });
  }
);

export default router;
