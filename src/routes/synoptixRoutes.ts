import { Request, Response, Router } from "express";
import {
  findAllFormsForWord,
  findNewMovie,
} from "../controllers/SynoptixController";
import { Game } from "../models/Game";
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
    currentGame = new Game(id, title, synopsis);
    res.send(currentGame.redactedGame());
  } catch (error) {
    res.status(500).send(error);
  }
});
router.get("/backend/word/:word", async (req: Request, res: Response) => {
  try {
    const { word } = req.params;
    const result = await findAllFormsForWord(word);
    res.send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/score/:word", async (req: Request, res: Response) => {
  const { word } = req.params;
  const score = await compareWordWithCloud(word, currentGame.wordCloud);
  return res.send(score);
});

export default router;
